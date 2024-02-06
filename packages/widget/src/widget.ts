import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { styles } from './styles';
import { switchNetworkIcon, sygmaLogo } from './assets';
import { WidgetController } from './controllers/widget';
import './components/network-selector';
import './components/amount-selector';
import './components/overlay-component';
import './components/address-input';
import { Directions } from './components/network-selector/network-selector';
import { BaseComponent } from './components/base-component/base-component';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends BaseComponent {
  static styles = styles;

  @state()
  private isLoading = false;

  private widgetController = new WidgetController(this, {});

  openOverlay(): void {
    this.isLoading = true;
  }

  closeOverlay(): void {
    this.isLoading = false;
  }

  render(): HTMLTemplateResult {
    return html`
      <p>${this.widgetController.isLoading ? 'Loading' : ''}</p>
      <section class="widgetContainer ${this.isLoading && 'noPointerEvents'}">
        <form @submit=${() => {}}>
          <section class="connectAccount">
            ${switchNetworkIcon} Connect Wallet
          </section>
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
        <section class="poweredBy">${sygmaLogo} Powered by Sygma</section>
        ${when(
          this.isLoading,
          () =>
            html`<sygma-overlay-component
              .isLoading=${this.isLoading}
            ></sygma-overlay-component>`
        )}
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
