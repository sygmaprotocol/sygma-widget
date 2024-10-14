import { ReactiveController, ReactiveElement } from 'lit';
import {
  Config,
  Environment,
  getRoutes,
  Network,
  RouteType,
  SygmaDomainConfig,
  type Domain,
  type Resource,
  type Route
} from '@buildwithsygma/core';
import { BigNumber } from 'ethers';
import {
  createFungibleAssetTransfer,
  TransactionRequest
} from '@buildwithsygma/evm';
import { createSubstrateFungibleAssetTransfer } from '@buildwithsygma/substrate';
import { TransferBuilder } from '../../lib/transfer-builder';
import { ContextConsumer } from '@lit/context';
import { walletContext } from '../../context';
import { substrateProviderContext } from '../../context/wallet';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { SubmittableResult } from '@polkadot/api';

export class SelectionsController implements ReactiveController {
  config: Config;

  environment!: Environment;
  selectedResource?: Resource;
  selectedSource?: Domain;
  selectedDestination?: Domain;
  specifiedTransferAmount?: bigint;
  recipientAddress: string = '';

  transferAmount?: BigNumber;

  allDomains: Domain[] = [];
  selectableSourceDomains: Domain[];
  selectableDestinationDomains: Domain[];
  selectableResources: Resource[];

  routesStorage: Map<string, Route[]> = new Map();
  host: ReactiveElement;
  walletContext: ContextConsumer<typeof walletContext, ReactiveElement>;
  substrateProviderContext: ContextConsumer<
    typeof substrateProviderContext,
    ReactiveElement
  >;

  errorBuildingTransfer: boolean = false;

  transfer:
    | Awaited<ReturnType<typeof createFungibleAssetTransfer>>
    | Awaited<ReturnType<typeof createSubstrateFungibleAssetTransfer>>
    | null = null;

  approvalTransactions: Array<TransactionRequest> = [];
  transferTransaction:
    | TransactionRequest
    | SubmittableExtrinsic<'promise', SubmittableResult>
    | null = null;

  get sourceDomainConfig(): SygmaDomainConfig | undefined {
    if (this.selectedSource) {
      return this.config.getDomainConfig(this.selectedSource);
    }
  }

  async initialize(params: { environment?: Environment }) {
    this.environment = params.environment ?? Environment.MAINNET;
    await this.config.init(this.environment);
    this.allDomains = this.config.getDomains();
    this.selectableSourceDomains = this.allDomains;
    this.selectableDestinationDomains = this.allDomains;
    this.host.requestUpdate();
  }

  constructor(host: ReactiveElement) {
    this.config = new Config();
    this.allDomains = [];
    this.selectableSourceDomains = [];
    this.selectableDestinationDomains = [];
    this.selectableResources = [];

    this.host = host;
    this.host.addController(this);

    this.walletContext = new ContextConsumer(host, {
      context: walletContext,
      subscribe: true
    });

    this.substrateProviderContext = new ContextConsumer(host, {
      context: substrateProviderContext,
      subscribe: true
    });
  }

  resetResource() {
    this.selectedResource = undefined;
    this.specifiedTransferAmount = undefined;
  }

  resetRecipientAddress() {
    this.recipientAddress = '';
  }

  hostConnected(): void {}

  selectSource(domain: Domain): void {
    if (this.selectedDestination) {
      this.resetResource();
      this.resetRecipientAddress();
      this.selectedDestination = undefined;
    }

    this.selectedSource = domain;
    void this.populateDestinations(domain);
    void this.tryBuildTransfer();
  }

  selectDestination(domain: Domain): void {
    if (this.selectedDestination) {
      this.resetResource();
      this.resetRecipientAddress();
    }

    this.selectedDestination = domain;
    if (this.selectedSource) {
      this.populateResources(this.selectedSource, domain);
    }
    this.host.requestUpdate();
    void this.tryBuildTransfer();
  }

  selectResourceAndAmount(resource: Resource, amount: BigNumber) {
    this.selectedResource = resource;
    this.transferAmount = amount;
    this.host.requestUpdate();
    void this.tryBuildTransfer();
  }

  setRecipientAddress = (address: string): void => {
    this.recipientAddress = address;
    this.host.requestUpdate();
    void this.tryBuildTransfer();
  };

  async populateDestinations(source: Domain) {
    if (!this.routesStorage.has(source.caipId)) {
      this.routesStorage.set(
        source.caipId,
        await getRoutes(source, this.environment, {
          routeTypes: [RouteType.FUNGIBLE]
        })
      );
    }

    const routes = this.routesStorage.get(source.caipId)!;
    const destinations = new Set(routes.map((route) => route.toDomain.chainId));

    this.selectableDestinationDomains = this.allDomains.filter((domain) => {
      return destinations.has(domain.chainId);
    });

    this.host.requestUpdate();
  }

  async populateResources(source: Domain, destination: Domain) {
    const routes = this.routesStorage.get(source.caipId);

    if (!routes) {
      this.selectableResources = [];
    }

    if (routes) {
      const routesWithDestination = new Set(
        routes
          .filter((route) => {
            return route.toDomain.caipId === destination.caipId;
          })
          .map((route) => route.resource.resourceId)
      );

      const resources = this.config.getResources(source);
      this.selectableResources = resources.filter((resource) => {
        return routesWithDestination.has(resource.resourceId);
      });
    }

    this.host.requestUpdate();
  }

  async tryBuildTransfer() {
    try {
      if (
        !this.selectedSource ||
        !this.selectedDestination ||
        !this.selectedResource ||
        !this.transferAmount ||
        !this.recipientAddress
      ) {
        this.transfer = null;
        return;
      }

      const sourceType = this.selectedSource.type;

      if (
        sourceType === Network.EVM &&
        !this.walletContext.value?.evmWallet?.provider &&
        !this.walletContext.value?.evmWallet?.address
      ) {
        this.transfer = null;
        return;
      }

      const provider =
        sourceType === Network.EVM
          ? this.walletContext.value!.evmWallet!.provider
          : this.substrateProviderContext.value?.substrateProviders?.get(
              this.selectedSource.caipId!
            )!;

      const builder = new TransferBuilder();
      const transfer = await builder.build(
        this.walletContext.value?.evmWallet?.address!,
        this.environment,
        this.selectedSource,
        this.selectedDestination,
        this.selectedResource,
        this.transferAmount,
        this.recipientAddress,
        provider
      );

      this.transfer = transfer;
      if ('getApprovalTransactions' in transfer) {
        this.approvalTransactions = await transfer.getApprovalTransactions();
      } else {
        this.approvalTransactions = [];
      }

      this.transferTransaction =
        (await transfer.getTransferTransaction()) as TransactionRequest;
    } catch (error) {
      console.error(error);
      this.transfer = null;
      this.errorBuildingTransfer = true;
    }
  }
}
