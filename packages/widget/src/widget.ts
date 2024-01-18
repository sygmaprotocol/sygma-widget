import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@buildwithsygma/sygmaprotocol-wallet-manager';
import '@buildwithsygma/sygmaprotocol-sdk-manager';
import './components/widget-app';
import { Network } from '@buildwithsygma/sygmaprotocol-wallet-manager';
import { styles } from './styles';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends LitElement {
  static styles = styles;

  render() {
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
