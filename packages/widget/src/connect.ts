import type {
  EthereumConfig,
  EvmResource,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import {
  Environment,
  Network,
  getEvmErc20Balance
} from '@buildwithsygma/sygma-sdk-core';
import { consume } from '@lit/context';
import { ethers } from 'ethers';
import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { when } from 'lit/directives/when.js';
import './components/amount-selector';
import './components/network-selector';
import type { SdkManager, WalletManagerController } from './controllers';
import { SdkManagerContext, WalletManagerContext } from './controllers';

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
  selectedToken?: string;

  @state({
    hasChanged: (n, o) => n !== o
  })
  tokenBalance?: string;

  @state({
    hasChanged: (n, o) => n !== o
  })
  tokenName?: string;

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedTokenAddress?: string;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    this.chainId = (
      await this.walletManager?.evmWallet?.web3Provider?.getNetwork()
    )?.chainId;

    this.walletManager?.addAccountChangedEventListener(() => {
      this.requestUpdate();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.walletManager?.addChainChangedEventListener(async () => {
      this.chainId = (
        await this.walletManager?.evmWallet?.web3Provider?.getNetwork()
      )?.chainId;

      void this.initSdk();

      this.requestUpdate();
    });

    // listen to the custom event for network change
    addEventListener('network-change', (event: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { detail } = event as CustomEvent;
      this.selectedNetworkChainId = Number(detail);
      this.requestUpdate();
    });

    addEventListener('amount-selector-change', (event: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { detail } = event as CustomEvent;
      this.selectedAmount = Number(detail);
      this.requestUpdate();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    addEventListener('token-change', async (event: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { detail } = event as CustomEvent;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.selectedToken = detail;

      const tokenInfo = this.resources?.find(
        (resource) => resource.resourceId === this.selectedToken
      );

      this.tokenName = tokenInfo?.symbol;

      if (this.homechain?.type === Network.EVM) {
        this.selectedTokenAddress = (tokenInfo as EvmResource).address;
        await this.fetchTokenBalance();
      }

      this.requestUpdate();
    });
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

  async connect(): Promise<void> {
    await this.walletManager?.connectEvmWallet();
    this.requestUpdate();
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

    this.requestUpdate();
  }

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

  render(): HTMLTemplateResult {
    if (!this.walletManager || !this.walletManager.accountData) {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      return html`<button @click=${this.connect}>Connect</button> `;
    } else {
      return html`<div>
        <p>EVM Account: ${this.walletManager.accountData}</p>
        <p>Network: ${this.chainId}</p>
        <p>SDK Status: ${this.sdkManager?.status}</p>
        ${this.sdkManager?.status === 'idle'
          ? // eslint-disable-next-line @typescript-eslint/unbound-method
            html`<button @click=${this.initSdk}>initialize sdk</button>`
          : undefined}
        ${when(
          this.sdkManager?.status !== 'idle' && this.domains && this.homechain,
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
              .domains=${this.destinationDomains}
              .directionLabel=${'to'}
              .networkIcons=${true}
              .selectedNetworkChainId=${this.selectedNetworkChainId}
            ></network-selector>
            <amount-selector
              .disabled=${false}
              .selectedNetworkChainId=${this.selectedNetworkChainId}
              .resources=${this.resources}
              .tokenBalance=${this.tokenBalance}
              .tokenName=${this.tokenName}
            >
            </amount-selector>
            ${choose(this.sdkManager?.status, [
              [
                'initialized',
                () =>
                  // eslint-disable-next-line @typescript-eslint/unbound-method
                  html`<button @click=${this.createTransfer}>
                    Create transfer
                  </button>`
              ],
              [
                'transferCreated',
                () =>
                  // eslint-disable-next-line @typescript-eslint/unbound-method
                  html`<button @click=${this.approveTokens}>Approve</button>`
              ],
              [
                'approvalsCompleted',
                () =>
                  // eslint-disable-next-line @typescript-eslint/unbound-method
                  html`<button @click=${this.performDeposit}>Transfer</button>`
              ]
            ])}
          `
        )}
      </div>`;
    }
  }
}

export { ConnectDialog };
