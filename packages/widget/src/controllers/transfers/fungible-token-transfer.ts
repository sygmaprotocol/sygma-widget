import type {
  Domain,
  EvmFee,
  Resource,
  Route
} from '@buildwithsygma/sygma-sdk-core';
import {
  Config,
  Environment,
  Network,
  getRoutes
} from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import type { UnsignedTransaction } from 'ethers';
import { BigNumber } from 'ethers';
import type { ReactiveController, ReactiveElement } from 'lit';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { SubmittableResult } from '@polkadot/api';
import type { SubstrateFee } from '@buildwithsygma/sygma-sdk-core/substrate';
import { walletContext } from '../../context';
import { MAINNET_EXPLORER_URL, TESTNET_EXPLORER_URL } from '../../constants';

import { buildEvmFungibleTransactions, executeNextEvmTransaction } from './evm';
import {
  buildSubstrateFungibleTransactions,
  executeNextSubstrateTransaction
} from './substrate';

export type SubstrateTransaction = SubmittableExtrinsic<
  'promise',
  SubmittableResult
>;

export enum FungibleTransferState {
  MISSING_SOURCE_NETWORK,
  MISSING_DESTINATION_NETWORK,
  MISSING_RESOURCE,
  MISSING_RESOURCE_AMOUNT,
  MISSING_DESTINATION_ADDRESS,
  WALLET_NOT_CONNECTED,
  WRONG_CHAIN,
  PENDING_APPROVALS,
  PENDING_TRANSFER,
  WAITING_USER_CONFIRMATION,
  WAITING_TX_EXECUTION,
  COMPLETED,
  UNKNOWN
}

export class FungibleTokenTransferController implements ReactiveController {
  public waitingUserConfirmation: boolean = false;
  public waitingTxExecution: boolean = false;
  public transferTransactionId?: string;
  public errorMessage: string | null = null;

  public sourceNetwork?: Domain;
  public destinationNetwork?: Domain;
  public selectedResource?: Resource;
  public resourceAmount: BigNumber = BigNumber.from(0);
  public destinatonAddress: string = '';

  public supportedSourceNetworks: Domain[] = [];
  public supportedDestinationNetworks: Domain[] = [];
  public supportedResources: Resource[] = [];
  public fee: EvmFee | SubstrateFee | null = null;

  //Evm transfer
  protected buildEvmTransactions = buildEvmFungibleTransactions;
  protected executeNextEvmTransaction = executeNextEvmTransaction;
  protected pendingEvmApprovalTransactions: UnsignedTransaction[] = [];
  protected pendingTransferTransaction?:
    | UnsignedTransaction
    | SubstrateTransaction;

  // Substrate transfer
  protected buildSubstrateTransactions = buildSubstrateFungibleTransactions;
  protected executeSubstrateTransaction = executeNextSubstrateTransaction;

  protected config: Config;
  protected env: Environment = Environment.MAINNET;
  //source network chain id -> Route[]
  protected routesCache: Map<number, Route[]> = new Map();

  host: ReactiveElement;
  walletContext: ContextConsumer<typeof walletContext, ReactiveElement>;

  constructor(host: ReactiveElement) {
    (this.host = host).addController(this);
    this.config = new Config();
    this.walletContext = new ContextConsumer(host, {
      context: walletContext,
      subscribe: true,
      callback: () => {
        try {
          this.buildTransactions();
        } catch (e) {
          console.error(e);
        }
        this.host.requestUpdate();
      }
    });
  }

  hostDisconnected(): void {
    this.reset();
  }

  async init(env: Environment): Promise<void> {
    this.host.requestUpdate();
    this.env = env;
    await this.config.init(1, env);
    this.supportedSourceNetworks = this.config.getDomains();
    //remove once we have proper substrate transfer support
    // .filter((n) => n.type === Network.EVM);
    this.supportedDestinationNetworks = this.config.getDomains();
    this.host.requestUpdate();
  }

  reset(): void {
    this.sourceNetwork = undefined;
    this.destinationNetwork = undefined;
    this.pendingEvmApprovalTransactions = [];
    this.pendingTransferTransaction = undefined;
    this.destinatonAddress = '';
    this.waitingTxExecution = false;
    this.waitingUserConfirmation = false;
    this.transferTransactionId = undefined;
    void this.init(this.env);
  }

  onSourceNetworkSelected = (network: Domain | undefined): void => {
    this.sourceNetwork = network;
    if (!network) {
      this.supportedResources = [];
      return;
    }
    this.sourceNetwork = network;
    void this.filterDestinationNetworksAndResources(network);
  };

  onDestinationNetworkSelected = (network: Domain | undefined): void => {
    this.destinationNetwork = network;
    if (this.sourceNetwork && !this.selectedResource) {
      //filter resources
      void this.filterDestinationNetworksAndResources(this.sourceNetwork);
      return;
    }
    void this.buildTransactions();
    this.host.requestUpdate();
  };

  onResourceSelected = (resource: Resource, amount: BigNumber): void => {
    this.selectedResource = resource;
    this.resourceAmount = amount;
    void this.buildTransactions();
    this.host.requestUpdate();
  };

  onDestinationAddressChange = (address: string): void => {
    this.destinatonAddress = address;
    if (this.destinatonAddress.length === 0) {
      this.pendingEvmApprovalTransactions = [];
      this.pendingTransferTransaction = undefined;
    }
    void this.buildTransactions();
    this.host.requestUpdate();
  };

  getTransferState(): FungibleTransferState {
    if (!this.sourceNetwork) {
      return FungibleTransferState.MISSING_SOURCE_NETWORK;
    }
    if (!this.destinationNetwork) {
      return FungibleTransferState.MISSING_DESTINATION_NETWORK;
    }
    if (!this.selectedResource) {
      return FungibleTransferState.MISSING_RESOURCE;
    }
    if (this.resourceAmount.eq(0)) {
      return FungibleTransferState.MISSING_RESOURCE_AMOUNT;
    }
    if (this.destinatonAddress === '') {
      return FungibleTransferState.MISSING_DESTINATION_ADDRESS;
    }
    if (
      !this.walletContext.value?.evmWallet &&
      !this.walletContext.value?.substrateWallet
    ) {
      return FungibleTransferState.WALLET_NOT_CONNECTED;
    }
    if (
      this.sourceNetwork.type === Network.EVM &&
      this.walletContext.value?.evmWallet?.providerChainId !==
        this.sourceNetwork.chainId
    ) {
      return FungibleTransferState.WRONG_CHAIN;
    }
    if (this.waitingUserConfirmation) {
      return FungibleTransferState.WAITING_USER_CONFIRMATION;
    }
    if (this.waitingTxExecution) {
      return FungibleTransferState.WAITING_TX_EXECUTION;
    }
    if (this.transferTransactionId) {
      return FungibleTransferState.COMPLETED;
    }
    if (this.pendingEvmApprovalTransactions.length > 0) {
      return FungibleTransferState.PENDING_APPROVALS;
    }
    if (this.pendingTransferTransaction) {
      return FungibleTransferState.PENDING_TRANSFER;
    }

    return FungibleTransferState.UNKNOWN;
  }

  executeTransaction(): void {
    if (!this.sourceNetwork) {
      return;
    }
    switch (this.sourceNetwork.type) {
      case Network.EVM:
        {
          void this.executeNextEvmTransaction();
        }
        break;
      case Network.SUBSTRATE:
        {
          //TODO: add substrate logic
          void this.executeSubstrateTransaction();
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
  }

  getExplorerLink(): string {
    if (this.env === Environment.MAINNET) {
      return `${MAINNET_EXPLORER_URL}${this.transferTransactionId}`;
    }
    return `${TESTNET_EXPLORER_URL}${this.transferTransactionId}`;
  }

  private filterDestinationNetworksAndResources = async (
    sourceNetwork: Domain
  ): Promise<void> => {
    if (!this.routesCache.has(sourceNetwork.chainId)) {
      this.routesCache.set(
        sourceNetwork.chainId,
        await getRoutes(this.env, sourceNetwork.chainId, 'fungible')
      );
    }
    this.supportedResources = [];
    if (!this.destinationNetwork) {
      this.supportedDestinationNetworks = this.routesCache
        .get(sourceNetwork.chainId)!
        .filter(
          (route) =>
            route.toDomain.chainId !== sourceNetwork.chainId &&
            !this.supportedDestinationNetworks.includes(route.toDomain)
        )
        .map((route) => route.toDomain);
    }
    this.supportedResources = this.routesCache
      .get(sourceNetwork.chainId)!
      .filter(
        (route) =>
          !this.destinationNetwork ||
          (route.toDomain.chainId === this.destinationNetwork?.chainId &&
            !this.supportedResources.includes(route.resource))
      )
      .map((route) => route.resource);
    //unselect destination if equal to source network or isn't in list of available destination networks
    if (
      this.destinationNetwork?.id === sourceNetwork.id ||
      !this.supportedDestinationNetworks.includes(this.destinationNetwork!)
    ) {
      this.destinationNetwork = undefined;
    }
    void this.buildTransactions();
    this.host.requestUpdate();
  };

  private buildTransactions(): void {
    if (
      !this.sourceNetwork ||
      !this.destinationNetwork ||
      !this.resourceAmount ||
      !this.selectedResource ||
      !this.destinatonAddress
    ) {
      return;
    }
    switch (this.sourceNetwork.type) {
      case Network.EVM:
        {
          void this.buildEvmTransactions();
        }
        break;
      case Network.SUBSTRATE:
        {
          void this.buildSubstrateTransactions();
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
  }
}
