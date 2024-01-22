import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './styles';
import { switchNetworkIcon, sygmaLogo } from './assets';
import { WidgetController } from './controllers/widget';
import './components/network-selector';
import './components/amount-selector';
import { Directions } from './components/network-selector/network-selector';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends LitElement {
  static styles = styles;

  private widgetController = new WidgetController(this, {});

  render(): HTMLTemplateResult {
    return html`
      <p>${this.widgetController.isLoading ? 'Loading' : ''}</p>
      <section class="widgetContainer">
        <form @submit=${() => {}}>
          <section class="connectAccount">
            <span>${switchNetworkIcon}</span>
            <span>Connect Wallet</span>
          </section>
          <section>
            <sygma-network-selector
              .direction=${Directions.FROM}
              .icons=${true}
              .onNetworkSelected=${this.widgetController
                .onSourceNetworkSelected}
              .networks=${this.widgetController.supportedSourceNetworks}
            >
            </sygma-network-selector>
          </section>
          <section>
            <sygma-network-selector
              .direction=${Directions.TO}
              .icons=${true}
              .onNetworkSelected=${this.widgetController
                .onDestinationNetworkSelected}
              .networks=${this.widgetController.supportedDestinationNetworks}
            >
            </sygma-network-selector>
          </section>
          <section>
            <sygma-resource-selector
              .resources=${this.widgetController.supportedResources}
              .onResourceSelected=${this.widgetController.onResourceSelected}
              .onAmountChange=${this.widgetController.onResourceAmountChange}
              accountBalance="0"
            >
            </sygma-resource-selector>
          </section>
          <section>
            <button
              .disabled=${!this.widgetController.isReadyForTransfer}
              type="button"
              @click="${() => this.widgetController.makeTransaction()}"
              class="actionButtonReady"
            >
              Transfer or Approve
            </button>
          </section>
        </form>
        <section class="poweredBy">
          <span>${sygmaLogo}</span>
          <span>Powered by Sygma</span>
        </section>
      </section>
    `;
  }
}

export { SygmaProtocolWidget };

declare global {
  interface HTMLElementTagNameMap {
    'sygmaprotocol-widget': SygmaProtocolWidget;
  }
}
