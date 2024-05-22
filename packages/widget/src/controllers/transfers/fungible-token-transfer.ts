import type {
  Domain,
  EthereumConfig,
  EvmFee,
  Resource,
  Route,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import {
  Config,
  Environment,
  getRoutes,
  Network
} from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import { ethers } from 'ethers';
import type { UnsignedTransaction, BigNumber } from 'ethers';
import type { ReactiveController, ReactiveElement } from 'lit';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type {
  ParachainID,
  SubstrateFee
} from '@buildwithsygma/sygma-sdk-core/substrate';
import type { WalletContext } from '../../context';
import { walletContext } from '../../context';
import { MAINNET_EXPLORER_URL, TESTNET_EXPLORER_URL } from '../../constants';
import { validateAddress } from '../../utils';
import { SdkInitializedEvent } from '../../interfaces';
import { substrateProviderContext } from '../../context/wallet';
import { estimateEvmGas, estimateSubstrateGas } from '../../utils/gas';
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
  INVALID_DESTINATION_ADDRESS,
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
  public destinationAddress?: string | null = '';

  public supportedSourceNetworks: Domain[] = [];
  public supportedDestinationNetworks: Domain[] = [];
  public supportedResources: Resource[] = [];
  public fee: EvmFee | SubstrateFee | null = null;
  public estimatedGas: BigNumber | undefined;

  //Evm transfer
  protected buildEvmTransactions = buildEvmFungibleTransactions;
  protected executeNextEvmTransaction = executeNextEvmTransaction;
  protected pendingEvmApprovalTransactions: UnsignedTransaction[] = [];
  public pendingTransferTransaction?:
    | UnsignedTransaction
    | SubstrateTransaction;

  // Substrate transfer
  protected buildSubstrateTransactions = buildSubstrateFungibleTransactions;
  protected executeSubstrateTransaction = executeNextSubstrateTransaction;

  protected config: Config;
  protected env: Environment = Environment.MAINNET;
  //source network chain id -> Route[]
  protected routesCache: Map<number, Route[]> = new Map();

  protected whitelistedSourceNetworks?: string[] = [];
  protected whitelistedDestinationNetworks?: string[] = [];
  protected whitelistedSourceResources?: string[] = [];

  host: ReactiveElement;
  walletContext: ContextConsumer<typeof walletContext, ReactiveElement>;
  substrateProviderContext: ContextConsumer<
    typeof substrateProviderContext,
    ReactiveElement
  >;

  get sourceSubstrateProvider(): ApiPromise | undefined {
    if (this.sourceNetwork && this.sourceNetwork.type === Network.SUBSTRATE) {
      const domainConfig = this.config.getDomainConfig(
        this.sourceNetwork.id
      ) as SubstrateConfig;
      return this.getSubstrateProvider(domainConfig.parachainId as ParachainID);
    }

    return undefined;
  }

  /**
   * Provides substrate provider
   * based on parachain id
   * @param {parachainId} parachainId
   * @returns {ApiPromise | undefined}
   */
  getSubstrateProvider(parachainId: ParachainID): ApiPromise | undefined {
    return this.substrateProviderContext.value?.substrateProviders?.get(
      parachainId
    );
  }

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
          void this.buildTransactions();
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

    this.substrateProviderContext = new ContextConsumer(host, {
      context: substrateProviderContext,
      subscribe: true
    });
  }
  get sourceDomainConfig(): EthereumConfig | SubstrateConfig | undefined {
    if (this.config.environment && this.sourceNetwork) {
      return this.config.getDomainConfig(this.sourceNetwork.id);
    }
    return undefined;
  }

  hostDisconnected(): void {
    this.reset();
  }

  /**
   * Infinite Try/catch wrapper around
   * {@link Config} from `@buildwithsygma/sygma-sdk-core`
   * and emits a {@link SdkInitializedEvent}
   * @param {number} time to wait before retrying request in ms
   * @returns {void}
   */
  async retryInitSdk(retryMs = 100): Promise<void> {
    try {
      await this.config.init(1, this.env);
      this.host.dispatchEvent(
        new SdkInitializedEvent({ hasInitialized: true })
      );
    } catch (error) {
      setTimeout(() => {
        this.retryInitSdk(retryMs * 2).catch(console.error);
      }, retryMs);
    }
  }

  /**
   * Filter source and destination networks specified by User
   * @param whitelistedNetworks
   * @param network
   */
  filterWhitelistedNetworks = (
    whitelistedNetworks: string[] | undefined,
    network: Domain
  ): boolean => {
    // skip filtering if whitelisted networks are empty
    if (!whitelistedNetworks?.length) return true;

    return whitelistedNetworks.some(
      (networkName) => networkName.toLowerCase() === network.name.toLowerCase()
    );
  };

  async init(
    env: Environment,
    options?: {
      whitelistedSourceNetworks?: string[];
      whitelistedDestinationNetworks?: string[];
      whitelistedSourceResources?: string[];
    }
  ): Promise<void> {
    this.host.requestUpdate();
    this.env = env;

    this.whitelistedSourceNetworks = options?.whitelistedSourceNetworks;
    this.whitelistedDestinationNetworks =
      options?.whitelistedDestinationNetworks;
    this.whitelistedSourceResources = options?.whitelistedSourceResources;

    await this.retryInitSdk();
    this.supportedSourceNetworks = this.config
      .getDomains()
      .filter((network) =>
        this.filterWhitelistedNetworks(
          options?.whitelistedSourceNetworks,
          network
        )
      );
    this.supportedDestinationNetworks = this.config
      .getDomains()
      .filter((network) =>
        this.filterWhitelistedNetworks(
          options?.whitelistedDestinationNetworks,
          network
        )
      );
    this.host.requestUpdate();
  }

  resetFee(): void {
    this.fee = null;
  }

  reset({ omitSourceNetworkReset } = { omitSourceNetworkReset: false }): void {
    if (!omitSourceNetworkReset) {
      this.sourceNetwork = undefined;
    }
    this.destinationNetwork = undefined;
    this.selectedResource = undefined;
    this.pendingEvmApprovalTransactions = [];
    this.pendingTransferTransaction = undefined;
    this.destinationAddress = '';
    this.waitingTxExecution = false;
    this.waitingUserConfirmation = false;
    this.transferTransactionId = undefined;
    this.estimatedGas = undefined;
    this.resetFee();
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

    if (this.destinationAddress && this.destinationAddress.length === 0) {
      this.pendingEvmApprovalTransactions = [];
      this.destinationAddress = null;
      this.pendingTransferTransaction = undefined;
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
    if (this.pendingTransferTransaction) {
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

    if (this.destinationAddress === '') {
      return FungibleTransferState.MISSING_DESTINATION_ADDRESS;
    }

    if (
      this.destinationAddress === null ||
      this.destinationAddress === undefined ||
      validateAddress(this.destinationAddress, this.destinationNetwork.type)
    ) {
      return FungibleTransferState.INVALID_DESTINATION_ADDRESS;
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
      this.resetFee();
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
        .filter((route) =>
          this.filterWhitelistedNetworks(
            this.whitelistedDestinationNetworks,
            route.toDomain
          )
        )
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
      .filter((route) => {
        // skip filter if resources are not specified
        if (!this.whitelistedSourceResources?.length) return true;

        return this.whitelistedSourceResources.includes(route.resource.symbol!);
      })
      .map((route) => route.resource);
    void this.buildTransactions();
    this.host.requestUpdate();
  };

  private async buildTransactions(): Promise<void> {
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
          //we already check that but this prevents those typescript errors
          const address = this.walletContext.value?.evmWallet?.address;
          const provider = this.walletContext.value?.evmWallet?.provider;
          const providerChainId =
            this.walletContext.value?.evmWallet?.providerChainId;
          if (
            !address ||
            !provider ||
            providerChainId !== this.sourceNetwork.chainId
          ) {
            this.estimatedGas = undefined;
            this.resetFee();
            return;
          }
          const {
            pendingEvmApprovalTransactions,
            pendingTransferTransaction,
            fee,
            resourceAmount
          } = await this.buildEvmTransactions({
            address,
            chainId: this.destinationNetwork.chainId,
            destinationAddress: this.destinationAddress,
            resourceId: this.selectedResource.resourceId,
            resourceAmount: this.resourceAmount,
            provider,
            providerChainId,
            env: this.env,
            fee: this.fee,
            pendingEvmApprovalTransactions: this.pendingEvmApprovalTransactions,
            pendingTransferTransaction: this
              .pendingTransferTransaction as UnsignedTransaction,
            sourceNetwork: this.sourceNetwork
          });

          this.fee = fee;
          this.resourceAmount = resourceAmount;

          this.pendingEvmApprovalTransactions = pendingEvmApprovalTransactions;
          this.pendingTransferTransaction = pendingTransferTransaction;

          await this.estimateGas(this.sourceNetwork);

          this.host.requestUpdate();
        }
        break;
      case Network.SUBSTRATE:
        {
          const substrateProvider = this.sourceSubstrateProvider;
          const address =
            this.walletContext.value?.substrateWallet?.signerAddress;

          if (!substrateProvider || !address) {
            this.estimatedGas = undefined;
            this.resetFee();
            return;
          }
          const { pendingTransferTransaction, fee, resourceAmount } =
            await this.buildSubstrateTransactions({
              address,
              substrateProvider,
              env: this.env,
              chainId: this.destinationNetwork.chainId,
              destinationAddress: this.destinationAddress,
              resourceId: this.selectedResource.resourceId,
              resourceAmount: this.resourceAmount,
              fee: this.fee as SubstrateFee,
              pendingTransferTransaction: this
                .pendingTransferTransaction as SubstrateTransaction
            });

          this.fee = fee;
          this.resourceAmount = resourceAmount;
          this.pendingTransferTransaction = pendingTransferTransaction;

          await this.estimateGas(this.sourceNetwork);
          this.host.requestUpdate();
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
  }

  public async estimateGas(sourceNetwork: Domain): Promise<void> {
    if (!sourceNetwork) return;
    switch (sourceNetwork.type) {
      case Network.EVM:
        if (
          !this.sourceNetwork?.chainId ||
          !this.walletContext.value?.evmWallet?.provider ||
          !this.walletContext.value.evmWallet.address
        )
          return;
        this.estimatedGas = await estimateEvmGas(
          this.getTransferState(),
          this.sourceNetwork?.chainId,
          this.walletContext.value?.evmWallet?.provider,
          this.walletContext.value.evmWallet.address,
          this.pendingEvmApprovalTransactions,
          this.pendingTransferTransaction as UnsignedTransaction
        );
        break;
      case Network.SUBSTRATE:
        if (!this.walletContext.value?.substrateWallet?.signerAddress) return;
        this.estimatedGas = await estimateSubstrateGas(
          this.walletContext.value?.substrateWallet?.signerAddress,
          this.pendingTransferTransaction as SubstrateTransaction
        );
        break;
    }
  }
}
