import './components';
import './components/common';
import type {
  EvmResource,
  Network,
  SubstrateResource
} from '@buildwithsygma/sygma-sdk-core';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { sygmaLogo } from './assets';
import { BaseComponent } from './components/common/base-component/base-component';
import { Directions } from './components/network-selector/network-selector';
import { WidgetController } from './controllers/widget';
import type {
  Eip1193Provider,
  ISygmaProtocolWidget,
  Theme
} from './interfaces';
import './context/wallet';
import { styles } from './styles';

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
                <sygma-action-button
                  text="Transfer or Approve"
                  @onClick="${() => this.widgetController.makeTransaction()}"
                  .disabled=${!this.widgetController.isReadyForTransfer}
                ></sygma-action-button>
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
