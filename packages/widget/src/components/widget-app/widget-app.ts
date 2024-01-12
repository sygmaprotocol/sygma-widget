import { LitElement, html } from 'lit';
import { consume } from '@lit/context';
import { customElement, state } from 'lit/decorators.js';
import {
  WalletManagerContext,
  WalletManagerController
} from '@buildwithsygma/sygmaprotocol-wallet-manager';

import {
  SdkManagerContext,
  SdkManager
} from '@buildwithsygma/sygmaprotocol-sdk-manager';

import {
  Environment,
  EthereumConfig,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';

import '../network-selector';
import '../amount-selector';

import { styles } from './styles';
import { switchNetworkIcon, sygmaLogo } from '../../assets';
import { when } from 'lit/directives/when.js';

@customElement('widget-app')
export default class WidgetApp extends LitElement {
  static styles = styles;

  @consume({ context: WalletManagerContext, subscribe: true })
  @state()
  walletManager?: WalletManagerController;

  @consume({ context: SdkManagerContext, subscribe: true })
  @state()
  sdkManager?: SdkManager;

  @state()
  chainId?: number;

  @state({
    hasChanged: (n, o) => n !== o
  })
  domains?: EthereumConfig[] | SubstrateConfig[];

  @state({
    hasChanged: (n, o) => n !== o
  })
  homechain?: EthereumConfig | SubstrateConfig;

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedNetworkChainId?: number;

  @state({
    hasChanged: (n, o) => n !== o
  })
  destinationDomains?: EthereumConfig[] | SubstrateConfig[];

  @state({
    hasChanged: (n, o) => n !== o
  })
  resources?: Resource[];

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedAmount?: number;

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedToken?: Pick<Resource, 'resourceId'>;

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

    addEventListener('token-change', (event: unknown) => {
      const { detail } = event as CustomEvent;
      this.selectedToken = detail;
      this.requestUpdate();
    });
  }

  async connect() {
    await this.walletManager?.connectEvmWallet();
    await this.initSdk();
    this.requestUpdate();
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
    await this.sdkManager.performApprovals(this.walletManager.evmWallet.signer);
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

  render() {
    return html`
      <section class="widgetContainer">
        <form @submit=${this.handleTransfer}>
          <section class="switchNetwork">
            <span>${switchNetworkIcon}</span>
            <span>Switch Network</span>
          </section>
          <section>
          <network-selector
              .directionLabel=${'from'}
              .networkIcons=${true}
              .homechain=${this.homechain}
              .isHomechain=${true}
              .selectedNetworkChainId=${this.chainId}
              .disabled=${true}
            ></network-selector>
          </section>
          <section>
          <network-selector
              .domains=${this.destinationDomains}
              .directionLabel=${'to'}
              .networkIcons=${true}
              .selectedNetworkChainId=${this.selectedNetworkChainId}
            ></network-selector>
            </section>
          <section>
          <amount-selector
              .disabled=${false}
              .selectedNetworkChainId=${this.selectedNetworkChainId}
              .resources=${this.resources}
            >
            </amount-selector>
          </section>
          <section>
            Transfer to the same address
          </section>
          <section>
            ${when(
              !this.walletManager || !this.walletManager.accountData,
              () =>
                html`<button
                  @click=${this.connect}
                  type="button"
                  class="actionButton"
                >
                  Connect
                </button> `,
              () =>
                html`<button type="submit" class="actionButtonReady">
                  Transfer
                </button>`
            )}
          </section>
          <section class="poweredBy">
            <span>${sygmaLogo}</span>
            <span>Powered by Sygma</span>
          </section>
        </section>
        </form>
    `;
  }
}
