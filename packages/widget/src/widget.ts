import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './components/widget-app';
import { styles } from './styles';
import { Network } from './controllers';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends LitElement {
  static styles = styles;

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
