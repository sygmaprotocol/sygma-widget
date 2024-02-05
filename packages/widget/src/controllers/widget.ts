import type { Domain, Resource } from '@buildwithsygma/sygma-sdk-core';
import {
  Config,
  EVMAssetTransfer,
  Environment,
  Network
} from '@buildwithsygma/sygma-sdk-core';
import { SubstrateAssetTransfer } from '@buildwithsygma/sygma-sdk-core/substrate';
import type { ContextProvider } from '@lit/context';
import type { ReactiveController, ReactiveElement } from 'lit';

export class WidgetController implements ReactiveController {
  public isLoading: boolean = false;
  public isReadyForTransfer: boolean = false;
  public sourceNetwork?: Domain;
  public destinationNetwork?: Domain;
  public selectedResource?: Resource;
  public resourceAmount = 0;
  public supportedSourceNetworks: Domain[] = [];
  public supportedDestinationNetworks: Domain[] = [];
  public supportedResources: Resource[] = [];
  public destinatonAddress?: string = '';

  //@ts-expect-error it will be used
  private assetTransfer?: EVMAssetTransfer | SubstrateAssetTransfer;

  private env: Environment;
  private config: Config;

  host: ReactiveElement;

  constructor(
    host: ReactiveElement,
    options: {
      env?: Environment;
    }
  ) {
    (this.host = host).addController(this);
    this.env = options.env ?? Environment.MAINNET;
    this.config = new Config();
  }

  hostConnected(): void {
    void this.init();
  }

  hostDisconnected(): void {
    this.assetTransfer = undefined;
    this.sourceNetwork = undefined;
    this.destinationNetwork = undefined;
    this.supportedSourceNetworks = [];
    this.supportedDestinationNetworks = [];
  }

  private async init(): Promise<void> {
    this.isLoading = true;
    this.host.requestUpdate();
    await this.config.init(1, this.env);
    this.supportedSourceNetworks = this.config.getDomains();
    this.supportedDestinationNetworks = this.config.getDomains();
    this.isLoading = false;
    this.host.requestUpdate();
  }

  async makeTransaction(): Promise<void> {
    //TODO: trigger next tx from AssetTransfer class (approval or actual transfer)
  }

  onConnectWallet = (): void => {
    if (this.sourceNetwork) {
      switch (this.sourceNetwork.type) {
        case Network.EVM:
          {
            //init EvmWallet
          }
          break;
        case Network.SUBSTRATE:
          {
            //init SubstrateWallet
          }
          break;
        default:
          throw new Error('Unsupported network type');
      }
    }
  };

  onSourceNetworkSelected = (network: Domain | undefined): void => {
    //TODO: filter out supported destination networks
    this.sourceNetwork = network;
    if (!network) {
      this.supportedResources = [];
      //disconnect wallet
      return;
    }
    switch (network.type) {
      case Network.EVM:
        {
          this.sourceNetwork = network;
          this.assetTransfer = new EVMAssetTransfer();
        }
        break;
      case Network.SUBSTRATE:
        {
          this.sourceNetwork = network;
          this.assetTransfer = new SubstrateAssetTransfer();
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
    //TODO: reinit config
    this.supportedResources = this.config.getDomainResources();
    this.host.requestUpdate();
  };

  onDestinationNetworkSelected = (network: Domain | undefined): void => {
    if (!this.sourceNetwork) {
      //TODO: filter out supported source networks
    }
    this.destinationNetwork = network;
    this.host.requestUpdate();
  };

  onResourceSelected = (resource: Resource): void => {
    console.log('resource', resource);
    this.selectedResource = resource;
  };

  onResourceAmountChange = (amount: number): void => {
    console.log('resource amount', amount);
    this.resourceAmount = amount;
  };

  onDestinationAddressChange = (address: string): void => {
    console.log('destination address', address);
    this.destinatonAddress = address;
  };
}
