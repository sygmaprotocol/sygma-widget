import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type {
  EvmResource,
  Network,
  SubstrateResource
} from '@buildwithsygma/sygma-sdk-core';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import { styles } from './styles';
import { switchNetworkIcon, sygmaLogo } from './assets';
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

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget extends LitElement implements ISygmaProtocolWidget {
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

  private widgetController = new WidgetController(this, {});

  render(): HTMLTemplateResult {
    return html`
      <p>${this.widgetController.isLoading ? 'Loading' : ''}</p>
      <section class="widgetContainer">
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
      </section>
    `;
  }
}

export { SygmaProtocolWidget };

declare global {
  interface HTMLElementTagNameMap {
    'sygmaprotocol-widget': ISygmaProtocolWidget;
  }
}
