import { LitElement, html, type HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import plusIcon from '../../assets/icons/plusIcon';
import { WalletController } from '../../controllers/wallet-manager/controller';
import { shortAddress } from '../../utils';
import { styles } from './connect-wallet.style';

@customElement('sygma-connect-wallet-btn')
export class ConnectWalletButton extends LitElement {
  static styles = styles;

  private walletController = new WalletController(this);

  @property({
    type: Object
  })
  sourceNetwork?: Domain;

  private onConnectClicked = (): void => {
    if (this.sourceNetwork) {
      this.walletController.connectWallet(this.sourceNetwork);
    }
  };

  private onDisconnectClicked = (): void => {
    this.walletController.disconnectWallet();
  };

  private isWalletConnected(): boolean {
    return !!this.walletController.evmWallet;
  }

  render(): HTMLTemplateResult {
    return html` <div class="connectWalletContainer">
      ${when(
        this.walletController.evmWallet?.address !== undefined,
        () =>
          html`<span
            class="walletAddress"
            title=${this.walletController.evmWallet?.address ?? ''}
            >${shortAddress(
              this.walletController.evmWallet?.address ?? ''
            )}</span
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
