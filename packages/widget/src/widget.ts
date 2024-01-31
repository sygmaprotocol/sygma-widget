import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sygmaLogo } from './assets';
import './components';
import { Directions } from './components/network-selector/network-selector';
import { WidgetController } from './controllers/widget';
import { styles } from './styles';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends LitElement {
  static styles = styles;

  private widgetController = new WidgetController(this, {});

  private renderConnect(): HTMLTemplateResult {
    if (this.widgetController.sourceNetwork) {
      return html`
        <sygma-connect-wallet-btn
          .sourceNetwork=${this.widgetController.sourceNetwork}
        ></sygma-connect-wallet-btn>
      `;
    }
    return html``;
  }

  render(): HTMLTemplateResult {
    return html`
      <section class="widgetContainer">
        <section class="widgetHeader">
          <div class="brandLogoContainer">
            <span class="brandLogo">${sygmaLogo}</span>
            <span class="title">&lt;Brand Name&gt; Transfer</span>
          </div>
          ${this.renderConnect()}
        </section>
        <section class="widgetContent">
          <form @submit=${() => {}}>
            <section class="networkSelectionWrapper">
              <sygma-network-selector
                .direction=${Directions.FROM}
                .icons=${true}
                .onNetworkSelected=${this.widgetController
                  .onSourceNetworkSelected}
                .networks=${this.widgetController.supportedSourceNetworks}
              >
              </sygma-network-selector>
            </section>
            <section class="networkSelectionWrapper">
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
        </section>
        <section class="poweredBy">${sygmaLogo} Powered by Sygma</section>
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
