import type { Domain, Resource } from '@buildwithsygma/sygma-sdk-core';
import {
  Config,
  Environment,
  Network,
  ResourceType
} from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import type { UnsignedTransaction } from 'ethers';
import { BigNumber } from 'ethers';
import type { ReactiveController, ReactiveElement } from 'lit';
import { walletContext } from '../../context/wallet';
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
  public resourceAmount: BigNumber = BigNumber.from(0);
  public destinatonAddress: string = '';

  public supportedSourceNetworks: Domain[] = [];
  public supportedDestinationNetworks: Domain[] = [];
  public supportedResources: Resource[] = [];

  //Evm transfer
  protected buildEvmTransactions = buildEvmFungibleTransactions;
  protected executeNextEvmTransaction = executeNextEvmTransaction;
  protected pendingEvmApprovalTransactions: UnsignedTransaction[] = [];
  protected pendingEvmTransferTransaction?: UnsignedTransaction;

  protected config: Config;
  protected env: Environment = Environment.TESTNET;

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

  hostConnected(): void {}

  hostDisconnected(): void {
    this.reset();
  }

  async init(env: Environment): Promise<void> {
    this.host.requestUpdate();
    this.env = env;
    await this.config.init(1, env);
    this.supportedSourceNetworks = this.config
      .getDomains()
      //remove once we have proper substrate transfer support
      .filter((n) => n.type === Network.EVM);
    this.supportedDestinationNetworks = this.config.getDomains();
    this.host.requestUpdate();
  }

  reset(): void {
    this.sourceNetwork = undefined;
    this.destinationNetwork = undefined;
    this.pendingEvmApprovalTransactions = [];
    this.pendingEvmTransferTransaction = undefined;
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
    void this.filterDestinationNetworks(network);
  };

  onDestinationNetworkSelected = (network: Domain | undefined): void => {
    this.destinationNetwork = network;
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
      this.pendingEvmTransferTransaction = undefined;
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
    if (this.pendingEvmTransferTransaction) {
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
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
  }

  getExplorerLink(): string {
    if (this.env === Environment.MAINNET) {
      return `https://scan.buildwithsygma.com/transfer/${this.transferTransactionId}`;
    }
    return `https://scan.test.buildwithsygma.com/transfer/${this.transferTransactionId}`;
  }

  private filterDestinationNetworks = async (
    sourceNetwork: Domain
  ): Promise<void> => {
    await this.config.init(sourceNetwork.chainId, this.env);
    this.supportedResources = this.config
      .getDomainResources()
      .filter((r) => r.type === ResourceType.FUNGIBLE);
    //remove selected source network from destination
    this.supportedDestinationNetworks = this.config
      .getDomains()
      .filter((n) => this.sourceNetwork?.id !== n.id);
    //unselect destination if equal to source network
    if (this.destinationNetwork?.id === sourceNetwork.id) {
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
          //TODO: add substrate logic
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
  }
}
