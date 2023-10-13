import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { WalletManagerContextProvider } from '@builtwithsygma/sygmaprotocol-wallet-manager'

@customElement('widget-root')
class WidgetRoot extends LitElement {
  render() {
    return html`<wallet-manager-context>
      <connect-dialog></connect-dialog>
    </wallet-manager-context>`;
  }
}

export { WidgetRoot };
