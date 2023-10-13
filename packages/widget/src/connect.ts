import { consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  WalletManagerContext,
  WalletManagerController
} from 'packages/wallet-manager/build';

@customElement('connect-dialog')
class ConnectDialog extends LitElement {
  @consume({ context: WalletManagerContext, subscribe: true })
  @property({ attribute: false })
  walletManager?: WalletManagerController;

  render() {
    if (!this.walletManager || !this.walletManager.account) {
      return html`<button @click=${this.walletManager?.connectEvmWallet}>
        Connect
      </button> `;
    } else {
      return html`<p>EVM Account: ${this.walletManager.evmWallet?.address}</p>`;
    }
  }
}

export { ConnectDialog };
