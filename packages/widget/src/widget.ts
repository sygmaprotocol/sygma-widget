import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { sygmaLogo } from './assets';
import './components';
import { Directions } from './components/network-selector/network-selector';
import './context/wallet';
import { WidgetController } from './controllers/widget';
import { styles } from './styles';
import { BaseComponent } from './components/base-component/base-component';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends BaseComponent {
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
      <sygma-wallet-context-provider>
        <section class="widgetContainer">
          <section class="widgetHeader">
            <div class="brandLogoContainer title">[Brand] Transfer</div>
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
                  .networks=${this.widgetController
                    .supportedDestinationNetworks}
                >
                </sygma-network-selector>
              </section>
              <section>
                <sygma-resource-selector
                  .resources=${this.widgetController.supportedResources}
                  .onResourceSelected=${this.widgetController
                    .onResourceSelected}
                  .onAmountChange=${this.widgetController
                    .onResourceAmountChange}
                  accountBalance="0"
                >
                </sygma-resource-selector>
              </section>
              <section>
                <sygma-address-input
                  .address=${this.widgetController.destinatonAddress}
                  .onAddressChange=${this.widgetController
                    .onDestinationAddressChange}
                >
                </sygma-address-input>
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
      </sygma-wallet-context-provider>
    `;
  }
}

export { SygmaProtocolWidget };

declare global {
  interface HTMLElementTagNameMap {
    'sygmaprotocol-widget': SygmaProtocolWidget;
  }
}
