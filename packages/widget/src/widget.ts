import { html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type {
  EvmResource,
  Network,
  SubstrateResource
} from '@buildwithsygma/sygma-sdk-core';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import { when } from 'lit/directives/when.js';
import { styles } from './styles';
import { sygmaLogo } from './assets';
import { WidgetController } from './controllers/widget';
import './components/network-selector';
import './components/amount-selector';
import './components/address-input';
import { Directions } from './components/network-selector/network-selector';
import type {
  Eip1193Provider,
  ISygmaProtocolWidget,
  Theme
} from './interfaces';
import './components';
import './context/wallet';
import { BaseComponent } from './components/base-component/base-component';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget
  extends BaseComponent
  implements ISygmaProtocolWidget
{
  static styles = styles;

  @property({ type: Array }) whitelistedSourceNetworks?: Network[];

  @property({ type: Array }) whitelistedDestinationNetworks?: Network[];

  @property({ type: Object }) evmProvider?: Eip1193Provider;

  @property() substrateProvider?: ApiPromise | string;

  @property({ type: Object }) substrateSigner?: Signer;

  @property({ type: Boolean }) show?: boolean;

  @property({ type: Array }) whitelistedSourceResources?: Array<
    EvmResource | SubstrateResource
  >;

  @property({ type: Boolean }) expandable?: boolean;

  @property({ type: Boolean }) darkTheme?: boolean;

  @property({ type: Object }) customLogo?: SVGElement;

  @property({ type: Object }) theme?: Theme;

  @state()
  private isLoading = false;

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
        <section
          class="widgetContainer ${this.isLoading ? 'noPointerEvents' : ''}"
        >
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
                  .disabled=${!this.widgetController.sourceNetwork ||
                  !this.widgetController.destinationNetwork}
                  .resources=${this.widgetController.supportedResources}
                  .onResourceSelected=${this.widgetController
                    .onResourceSelected}
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
          ${when(
            this.isLoading,
            () => html`<sygma-overlay-component></sygma-overlay-component>`
          )}
        </section>
      </sygma-wallet-context-provider>
    `;
  }
}

export { SygmaProtocolWidget };

declare global {
  interface HTMLElementTagNameMap {
    'sygmaprotocol-widget': ISygmaProtocolWidget;
  }
}
