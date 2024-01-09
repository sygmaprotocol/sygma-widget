import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@buildwithsygma/sygmaprotocol-wallet-manager';
import '@buildwithsygma/sygmaprotocol-sdk-manager';
import './connect';
import { Network } from '@buildwithsygma/sygmaprotocol-wallet-manager';

@customElement('widget-root')
class WidgetRoot extends LitElement {
  render() {
    return html`<wallet-manager-context-provider .network=${Network.EVM}>
      <sdk-manager-context-provider>
        <connect-dialog></connect-dialog>
      </sdk-manager-context-provider>
    </wallet-manager-context-provider>`;
  }
}

export { WidgetRoot };
