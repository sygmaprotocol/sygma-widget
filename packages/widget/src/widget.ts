import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './components/widget-app';
import type { ethers } from 'ethers';
import type { ApiPromise } from '@polkadot/api';
import { styles } from './styles';
import { Network } from './controllers';
import type { ISygmaProtocolWidget } from './interfaces';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends LitElement {
  static styles = styles;

  @property({
    type: Object
  })
  network?: Network;

  @property({
    type: Object
  })
  evmProvider?: ethers.providers.Web3Provider;

  @property({
    type: Object
  })
  apiPromise?: ApiPromise;

  @property({
    type: String
  })
  wssConnectionUrl?: string;

  render(): HTMLTemplateResult {
    return html`<wallet-manager-context-provider .network=${Network.EVM}>
      <sdk-manager-context-provider>
        <section class="widgetContainer">
          <widget-app></widget-app>
        </section>
      </sdk-manager-context-provider>
    </wallet-manager-context-provider>`;
  }
}

export { SygmaProtocolWidget };

declare global {
  interface HTMLElementTagNameMap {
    'sygmaprotocol-widget': ISygmaProtocolWidget;
  }
}
