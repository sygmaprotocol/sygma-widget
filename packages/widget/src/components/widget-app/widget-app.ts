import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import {
  Environment,
  EthereumConfig,
  EvmResource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';

import { getEvmErc20Balance } from '@buildwithsygma/sygma-sdk-core/evm';

import './widget-view';
import WidgetMixin from './widget-mixin';
import { ethers } from 'ethers';

@customElement('widget-app')
export default class WidgetApp extends WidgetMixin(LitElement) {
  // eslint-disable-next-line class-methods-use-this
  async handleTransfer() {}

  async getChainId() {
    if (this.walletManager?.evmWallet?.web3Provider) {
      const chainId = (
        await this.walletManager?.evmWallet?.web3Provider?.getNetwork()
      ).chainId;
      return chainId;
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

      this.initSdk();

      this.requestUpdate();
    });

    // listen to the custom event for network change
    addEventListener('network-change', (event: unknown) => {
      const { detail } = event as CustomEvent;
      this.selectedNetworkChainId = Number(detail);
      this.requestUpdate();
    });

    addEventListener('amount-selector-change', (event: unknown) => {
      const { detail } = event as CustomEvent;
      this.selectedAmount = Number(detail);
      this.requestUpdate();
    });

    addEventListener('token-change', async (event: unknown) => {
      const { detail } = event as CustomEvent;
      this.selectedToken = detail;

      const tokenInfo = this.resources?.find(
        (resource) => resource.resourceId === this.selectedToken
      );

      this.tokenName = tokenInfo?.symbol;

      if (this.homechain?.type === 'evm') {
        this.selectedTokenAddress = (tokenInfo as EvmResource).address;
        await this.fetchTokenBalance();
      }

      this.requestUpdate();
    });

    addEventListener('connectionInitialized', async (event: unknown) => {
      const { detail } = event as CustomEvent;
      if (detail.connectionInitiliazed) {
        await this.connect();
      }
    });
  }

  async initSdk() {
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

  async connect() {
    await this.walletManager?.connectEvmWallet();
    await this.initSdk();
    this.requestUpdate();
  }

  async createTransfer() {
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

  async approveTokens() {
    if (!this.sdkManager) {
      throw new Error('SDK Manager not initialized');
    }
    if (!this.walletManager?.evmWallet?.signer) {
      throw new Error('No wallet connected');
    }
    await this.sdkManager.performApprovals(
      this.walletManager!.evmWallet.signer
    );
    this.requestUpdate();
  }

  async performDeposit() {
    if (!this.sdkManager) {
      throw new Error('SDK Manager not initialized');
    }
    if (!this.walletManager?.evmWallet?.signer) {
      throw new Error('No wallet connected');
    }
    await this.sdkManager.performDeposit(this.walletManager.evmWallet.signer);
    this.requestUpdate();
  }

  async fetchTokenBalance() {
    if (this.homechain?.type === 'evm' && this.selectedTokenAddress) {
      const balance = await getEvmErc20Balance(
        this.walletManager?.accountData as string,
        this.selectedTokenAddress,
        this.walletManager?.evmWallet
          ?.web3Provider as ethers.providers.Web3Provider
      );

      this.tokenBalance = ethers.utils.formatUnits(balance, 18);
    }
  }

  render() {
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
