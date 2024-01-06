import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
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
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import { when } from 'lit/directives/when.js';
import './components/network-selector';

@customElement('connect-dialog')
class ConnectDialog extends LitElement {
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

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.chainId = (
      await this.walletManager?.evmWallet?.web3Provider?.getNetwork()
    )?.chainId;

    this.walletManager?.addAccountChangedEventListener(() => {
      this.requestUpdate();
    });
    this.walletManager?.addChainChangedEventListener(async () => {
      this.chainId = (
        await this.walletManager?.evmWallet?.web3Provider?.getNetwork()
      )?.chainId;

      this.requestUpdate();
    });

    // listen to the custom event for network change
    addEventListener('network-change', (event: unknown) => {
      const { detail } = event as CustomEvent;
      this.selectedNetworkChainId = Number(detail);
      this.requestUpdate();
    });
  }

  async connect() {
    await this.walletManager?.connectEvmWallet();
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
    console.log('this.sdkManager', this.sdkManager?.assetTransfer.config);

    if (!this.walletManager || !this.walletManager.accountData) {
      return html`<button @click=${this.connect}>Connect</button> `;
    } else {
      return html`<div>
        <p>EVM Account: ${this.walletManager.accountData}</p>
        <p>Network: ${this.chainId}</p>
        <p>SDK Status: ${this.sdkManager?.status}</p>
        ${this.sdkManager?.status === 'idle'
          ? html`<button @click=${this.initSdk}>initialize sdk</button>`
          : undefined}
        ${when(
          this.sdkManager?.status === 'initialized' &&
            this.domains &&
            this.homechain,
          () => html`
            <network-selector
              .directionLabel=${'from'}
              .networkIcons=${true}
              .homechain=${this.homechain}
              isHomechain=${true}
              .selectedNetworkChainId=${this.chainId}
              .disabled=${true}
            ></network-selector>
            <network-selector
              .domains=${this.domains}
              .directionLabel=${'to'}
              .networkIcons=${true}
              .selectedNetworkChainId=${this.selectedNetworkChainId}
            ></network-selector>
          `
        )}
        ${this.sdkManager &&
        this.sdkManager.status === 'transferCreated' &&
        this.sdkManager.approvalTxs &&
        this.sdkManager.approvalTxs.length > 0
          ? html`<button @click=${this.approveTokens}>approve</button>`
          : undefined}
        ${this.sdkManager &&
        this.sdkManager.status === 'approvalsCompleted' &&
        this.sdkManager.depositTx
          ? html`<button @click=${this.performDeposit}>Transfer</button>`
          : undefined}
      </div>`;
    }
  }
}

export { ConnectDialog };
