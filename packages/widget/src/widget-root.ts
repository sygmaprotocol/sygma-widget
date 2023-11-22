import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@builtwithsygma/sygmaprotocol-wallet-manager';
import '@builtwithsygma/sygmaprotocol-sdk-manager';
import './connect';
import { Networks } from '@builtwithsygma/sygmaprotocol-wallet-manager';

@customElement('widget-root')
class WidgetRoot extends LitElement {
  render() {
    return html`<wallet-manager-context-provider .networks=${Networks.EVM}>
      <sdk-manager-context-provider>
        <connect-dialog></connect-dialog>
      </sdk-manager-context-provider>
    </wallet-manager-context-provider>`;
  }
}

export { WidgetRoot };
