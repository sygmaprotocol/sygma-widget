import type { Domain, Resource, Route } from '@buildwithsygma/sygma-sdk-core';
import {
  Config,
  Environment,
  Network,
  getRoutes
} from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import type { UnsignedTransaction, BigNumber } from 'ethers';
import { ethers } from 'ethers';
import type { ReactiveController, ReactiveElement } from 'lit';
import type { WalletContext } from '../../context';
import { walletContext } from '../../context';
import { MAINNET_EXPLORER_URL, TESTNET_EXPLORER_URL } from '../../constants';
import { buildEvmFungibleTransactions, executeNextEvmTransaction } from './evm';

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
  public resourceAmount: BigNumber = ethers.constants.Zero;
  public destinationAddress: string = '';

  public supportedSourceNetworks: Domain[] = [];
  public supportedDestinationNetworks: Domain[] = [];
  public supportedResources: Resource[] = [];

  //Evm transfer
  protected buildEvmTransactions = buildEvmFungibleTransactions;
  protected executeNextEvmTransaction = executeNextEvmTransaction;
  protected pendingEvmApprovalTransactions: UnsignedTransaction[] = [];
  protected pendingEvmTransferTransaction?: UnsignedTransaction;

  protected config: Config;
  protected env: Environment = Environment.MAINNET;
  //source network chain id -> Route[]
  protected routesCache: Map<number, Route[]> = new Map();

  host: ReactiveElement;
  walletContext: ContextConsumer<typeof walletContext, ReactiveElement>;

  isWalletDisconnected(context: WalletContext): boolean {
    // Skip the method call during init
    if (Object.values(context).length === 0) return false;

    return !(!!context.evmWallet || !!context.substrateWallet);
  }

  constructor(host: ReactiveElement) {
    (this.host = host).addController(this);
    this.config = new Config();
    this.walletContext = new ContextConsumer(host, {
      context: walletContext,
      subscribe: true,
      callback: (context: Partial<WalletContext>) => {
        try {
          this.buildTransactions();
        } catch (e) {
          console.error(e);
        }
        this.host.requestUpdate();

        if (this.isWalletDisconnected(context)) {
          this.reset();
          this.supportedResources = [];
        }
      }
    });
  }

  hostDisconnected(): void {
    this.reset();
  }

  async init(env: Environment): Promise<void> {
    this.host.requestUpdate();
    this.env = env;
    await this.config.init(1, this.env);
    this.supportedSourceNetworks = this.config
      .getDomains()
      //remove once we have proper substrate transfer support
      .filter((n) => n.type === Network.EVM);
    this.supportedDestinationNetworks = this.config.getDomains();
    this.host.requestUpdate();
  }

  reset({ omitSourceNetworkReset } = { omitSourceNetworkReset: false }): void {
    if (!omitSourceNetworkReset) {
      this.sourceNetwork = undefined;
    }
    this.destinationNetwork = undefined;
    this.pendingEvmApprovalTransactions = [];
    this.pendingEvmTransferTransaction = undefined;
    this.destinationAddress = '';
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

  setSenderDefaultDestinationAddress = (): void => {
    if (!this.sourceNetwork || !this.destinationNetwork) {
      this.destinationAddress = '';
      return;
    }

    const isSameNetwork =
      this.sourceNetwork.chainId === this.destinationNetwork.chainId;
    const isSameType = this.sourceNetwork.type === this.destinationNetwork.type;

    this.destinationAddress =
      isSameNetwork || isSameType
        ? this.walletContext.value?.evmWallet?.address || ''
        : '';
  };

  onDestinationNetworkSelected = (network: Domain | undefined): void => {
    this.destinationNetwork = network;
    this.setSenderDefaultDestinationAddress();
    if (this.sourceNetwork) {
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
    this.destinationAddress = address;
    if (this.destinationAddress.length === 0) {
      this.pendingEvmApprovalTransactions = [];
      this.pendingEvmTransferTransaction = undefined;
    }
    void this.buildTransactions();
    this.host.requestUpdate();
  };

  getTransferState(): FungibleTransferState {
    if (this.transferTransactionId) {
      return FungibleTransferState.COMPLETED;
    }
    if (this.waitingUserConfirmation) {
      return FungibleTransferState.WAITING_USER_CONFIRMATION;
    }
    if (this.waitingTxExecution) {
      return FungibleTransferState.WAITING_TX_EXECUTION;
    }
    if (this.pendingEvmApprovalTransactions.length > 0) {
      return FungibleTransferState.PENDING_APPROVALS;
    }
    if (this.pendingEvmTransferTransaction) {
      return FungibleTransferState.PENDING_TRANSFER;
    }
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
    if (this.destinationAddress === '') {
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
    const routes = this.routesCache.get(sourceNetwork.chainId)!;

    // unselect destination if equal to source network or isn't in list of available destination networks
    if (this.destinationNetwork?.id === sourceNetwork.id || !routes.length) {
      this.destinationNetwork = undefined;
      this.selectedResource = undefined;
      this.supportedDestinationNetworks = [];
    }

    // either first time or we had source === destination
    if (!this.destinationNetwork) {
      this.supportedDestinationNetworks = routes
        .filter((route) => route.toDomain.chainId !== sourceNetwork.chainId)
        .map((route) => route.toDomain);
    } // source change but not destination, check if route is supported
    else if (this.supportedDestinationNetworks.length && routes.length) {
      const isSourceOnSuportedDestinations =
        this.supportedDestinationNetworks.some(
          (destinationDomain) =>
            destinationDomain.chainId === this.sourceNetwork?.chainId
        );
      if (isSourceOnSuportedDestinations) {
        this.supportedDestinationNetworks = routes
          .filter(
            (route) =>
              route.toDomain.chainId !== sourceNetwork.chainId &&
              !this.supportedDestinationNetworks.includes(route.toDomain)
          )
          .map((route) => route.toDomain);
      }
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

    void this.buildTransactions();
    this.host.requestUpdate();
  };

  private buildTransactions(): void {
    if (
      !this.sourceNetwork ||
      !this.destinationNetwork ||
      !this.resourceAmount ||
      !this.selectedResource ||
      !this.destinationAddress
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
          //TODO: add substrate logic
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
  }
}
