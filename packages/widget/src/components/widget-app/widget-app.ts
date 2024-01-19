import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import type {
  EthereumConfig,
  EvmResource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import { Environment, Network } from '@buildwithsygma/sygma-sdk-core';

import { getEvmErc20Balance } from '@buildwithsygma/sygma-sdk-core/evm';

import './widget-view';
import { ethers } from 'ethers';
import WidgetMixin from './widget-mixin';

@customElement('widget-app')
export default class WidgetApp extends WidgetMixin(LitElement) {
  handleTransfer = async (): Promise<void> => {};

  async getChainId(): Promise<number | undefined> {
    if (this.walletManager?.evmWallet?.web3Provider) {
      return (await this.walletManager?.evmWallet?.web3Provider?.getNetwork())
        ?.chainId;
    }
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.chainId = await this.getChainId();

    this.walletManager?.addAccountChangedEventListener(() => {
      this.requestUpdate();
    });

    this.walletManager?.addChainChangedEventListener(async () => {
      this.chainId = (
        await this.walletManager?.evmWallet?.web3Provider?.getNetwork()
      )?.chainId;

      void this.initSdk();

      this.requestUpdate();
    });

    // listen to the custom event for network change
    addEventListener('network-change', (event: unknown) => {
      const { detail } = event as CustomEvent<string>;
      this.selectedNetworkChainId = Number(detail);
      this.requestUpdate();
    });

    addEventListener('amount-selector-change', (event: unknown) => {
      const { detail } = event as CustomEvent<string>;
      this.selectedAmount = Number(detail);
      this.requestUpdate();
    });

    addEventListener('token-change', (event: unknown) => {
      const { detail } = event as CustomEvent<string>;

      this.selectedToken = detail;

      const tokenInfo = this.resources?.find(
        (resource) => resource.resourceId === this.selectedToken
      );

      this.tokenName = tokenInfo?.symbol;

      if (this.homechain?.type === Network.EVM) {
        this.selectedTokenAddress = (tokenInfo as EvmResource).address;

        void this.fetchTokenBalance().then(() => this.requestUpdate());
      } else {
        this.requestUpdate();
      }
    });

    addEventListener('connectionInitialized', (event: unknown) => {
      const { detail } = event as CustomEvent<{
        connectionInitialized: boolean;
      }>;

      if (detail.connectionInitialized) {
        void this.connect();
      }
    });
  }

  async initSdk(): Promise<void> {
    if (!this.walletManager?.evmWallet?.web3Provider) {
      throw new Error('No provider');
    }
    await this.sdkManager?.initializeSdk(
      this.walletManager.evmWallet?.web3Provider,
      Environment.TESTNET
    );

    const domains = this.sdkManager?.assetTransfer.config.getDomains();
    this.domains = domains as EthereumConfig[] | SubstrateConfig[];

    this.homechain =
      this.sdkManager?.assetTransfer.config.getSourceDomainConfig();

    this.resources = this.homechain?.resources;

    this.destinationDomains = this.domains?.filter(
      (domain) => domain.chainId !== this.chainId
    ) as EthereumConfig[] | SubstrateConfig[];

    if (!this.chainId) {
      this.chainId = await this.getChainId();
    }

    this.requestUpdate();
  }

  connect = async (): Promise<void> => {
    await this.walletManager?.connectEvmWallet();
    await this.initSdk();
    this.requestUpdate();
  };

  async createTransfer(): Promise<void> {
    if (!this.walletManager?.evmWallet?.address) {
      throw new Error('No wallet connected');
    }
    await this.sdkManager?.initializeTransfer(
      this.walletManager.evmWallet.address,
      this.chainId === 11155111 ? 5 : 11155111,
      this.walletManager.evmWallet.address,
      '0x0000000000000000000000000000000000000000000000000000000000000300',
      '5000000000000000000' // 18 decimal places
    );
    this.requestUpdate();
  }

  async approveTokens(): Promise<void> {
    if (!this.sdkManager) {
      throw new Error('SDK Manager not initialized');
    }
    if (!this.walletManager?.evmWallet?.signer) {
      throw new Error('No wallet connected');
    }
    await this.sdkManager.performApprovals(this.walletManager.evmWallet.signer);
    this.requestUpdate();
  }

  async performDeposit(): Promise<void> {
    if (!this.sdkManager) {
      throw new Error('SDK Manager not initialized');
    }
    if (!this.walletManager?.evmWallet?.signer) {
      throw new Error('No wallet connected');
    }
    await this.sdkManager.performDeposit(this.walletManager.evmWallet.signer);
    this.requestUpdate();
  }

  async fetchTokenBalance(): Promise<void> {
    if (this.homechain?.type === Network.EVM && this.selectedTokenAddress) {
      const balance = await getEvmErc20Balance(
        this.walletManager?.accountData as string,
        this.selectedTokenAddress,
        this.walletManager?.evmWallet
          ?.web3Provider as ethers.providers.Web3Provider
      );

      this.tokenBalance = ethers.utils.formatUnits(balance, 18);
    }
  }

  render(): HTMLTemplateResult {
    return html`
      <widget-view
        .chainId=${this.chainId}
        .domains=${this.domains}
        .homechain=${this.homechain}
        .resources=${this.resources}
        .selectedAmount=${this.selectedAmount}
        .selectedToken=${this.selectedToken}
        .selectedNetworkChainId=${this.selectedNetworkChainId}
        .walletManager=${this.walletManager}
        .connect=${this.connect}
        .handleTransfer=${this.handleTransfer}
        .destinationDomains=${this.destinationDomains}
        .tokenBalance=${this.tokenBalance}
      ></widget-view>
    `;
  }
}
