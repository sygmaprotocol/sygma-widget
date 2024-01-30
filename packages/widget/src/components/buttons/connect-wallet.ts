import { LitElement, html, type HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { ifDefined } from 'lit/directives/if-defined.js';
import plusIcon from '../../assets/icons/plusIcon';
import { WalletController } from '../../controllers/wallet-manager/controller';
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

  render(): HTMLTemplateResult {
    return html` <div class="connectWalletContainer">
      ${ifDefined(this.walletController.evmWallet?.address)}
      <button @click=${this.onConnectClicked} class="connectWalletButton">
        ${plusIcon} Connect Wallet
      </button>
    </div>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'sygma-connect-wallet-btn': ConnectWalletButton;
  }
}
