import type { Domain, Resource } from '@buildwithsygma/sygma-sdk-core';
import {
  Config,
  Environment,
  Network,
  ResourceType
} from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import type { UnsignedTransaction } from 'ethers';
import type { ReactiveController, ReactiveElement } from 'lit';
import { walletContext } from '../../context/wallet';
import { buildEvmFungibleTransactions, executeNextEvmTransaction } from './evm';

export enum TransferState {
  PREPARING,
  PENDING_APPROVALS,
  PENDING_TRANSFER,
  WAITING,
  COMPLETE,
  ERROR
}

export class FungibleTokenTransferController implements ReactiveController {
  public isLoading: boolean = false;

  public transferState: TransferState = TransferState.PREPARING;
  public errorMessage: string | null = null;

  public sourceNetwork?: Domain;
  public destinationNetwork?: Domain;
  public selectedResource?: Resource;
  public resourceAmount = 0;
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
      subscribe: true
    });
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    this.sourceNetwork = undefined;
    this.destinationNetwork = undefined;
    this.supportedSourceNetworks = [];
    this.supportedDestinationNetworks = [];
  }

  async init(env: Environment): Promise<void> {
    this.isLoading = true;
    this.host.requestUpdate();
    this.env = env;
    await this.config.init(1, env);
    this.supportedSourceNetworks = this.config.getDomains();
    this.supportedDestinationNetworks = this.config.getDomains();
    this.isLoading = false;
    this.host.requestUpdate();
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

  onResourceSelected = (resource: Resource, amount: number): void => {
    this.selectedResource = resource;
    this.resourceAmount = amount;
    void this.buildTransactions();
    this.host.requestUpdate();
  };

  onDestinationAddressChange = (address: string): void => {
    this.destinatonAddress = address;
    void this.buildTransactions();
    this.host.requestUpdate();
  };

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

  private filterDestinationNetworks = async (
    sourceNetwork: Domain
  ): Promise<void> => {
    await this.config.init(sourceNetwork.chainId, this.env);
    this.supportedResources = this.config
      .getDomainResources()
      .filter((r) => r.type === ResourceType.FUNGIBLE);

    console.log(this.supportedResources);
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
