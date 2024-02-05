import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { consume } from '@lit/context';
import type { HTMLTemplateResult, PropertyValues } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import plusIcon from '../../assets/icons/plusIcon';
import type { WalletContext } from '../../context';
import { walletContext } from '../../context';
import { WalletController } from '../../controllers';
import { shortAddress } from '../../utils';
import { styles } from './connect-wallet.style';

@customElement('sygma-connect-wallet-btn')
export class ConnectWalletButton extends LitElement {
  static styles = styles;

  @property({
    type: Object,
    attribute: true,
    hasChanged: (value: Domain, old: Domain) => {
      return value?.id !== old?.id;
    }
  })
  sourceNetwork?: Domain;

  @property({
    type: String
  })
  dappUrl?: string;

  @consume({ context: walletContext, subscribe: true })
  @state()
  private wallets!: WalletContext;

  private walletController = new WalletController(this);

  connectedCallback(): void {
    super.connectedCallback();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('sourceNetwork')) {
      this.walletController.sourceNetworkUpdated(this.sourceNetwork);
    }
  }

  private onConnectClicked = (): void => {
    if (this.sourceNetwork) {
      this.walletController.connectWallet(this.sourceNetwork, {
        dappUrl: this.dappUrl
      });
    }
  };

  private onDisconnectClicked = (): void => {
    this.walletController.disconnectEvmWallet();
  };

  private isWalletConnected(): boolean {
    return !!this.wallets.evmWallet;
  }

  render(): HTMLTemplateResult {
    const evmWallet = this.wallets.evmWallet;
    return html` <div class="connectWalletContainer">
      ${when(
        evmWallet?.address !== undefined,
        () =>
          html`<span class="walletAddress" title=${evmWallet?.address ?? ''}
            >${shortAddress(evmWallet?.address ?? '')}</span
          >`
      )}
      ${when(
        this.isWalletConnected(),
        () =>
          html`<button
            @click=${this.onDisconnectClicked}
            class="connectWalletButton"
          >
            Disconnect
          </button>`,
        () =>
          html`<button
            @click=${this.onConnectClicked}
            class="connectWalletButton"
          >
            ${plusIcon} Connect Wallet
          </button>`
      )}
    </div>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'sygma-connect-wallet-btn': ConnectWalletButton;
  }
}
