import {
  Environment,
  Network,
  type EvmResource,
  type SubstrateResource,
  Domain
} from '@buildwithsygma/sygma-sdk-core';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { sygmaLogo } from './assets';
import './components';
import './components/address-input';
import './components/fungibleTokenTransfer';
import './components/amount-selector';
import { BaseComponent } from './components/base-component/base-component';
import './components/network-selector';
import './context/wallet';
import { WidgetController } from './controllers/widget';
import type {
  Eip1193Provider,
  ISygmaProtocolWidget,
  Theme
} from './interfaces';
import { styles } from './styles';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget
  extends BaseComponent
  implements ISygmaProtocolWidget
{
  static styles = styles;

  @property({ type: Array }) whitelistedSourceNetworks?: string[];

  @property({ type: Array }) whitelistedDestinationNetworks?: string[];

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

  @state()
  private sourceNetwork?: Domain;

  private widgetController = new WidgetController(this);

  private renderConnect(): HTMLTemplateResult {
    if (this.sourceNetwork) {
      return html`
        <sygma-connect-wallet-btn
          .sourceNetwork=${this.sourceNetwork}
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
           <sygma-fungible-transfer 
           .onSourceNetworkSelected=${(domain: Domain) => this.sourceNetwork = domain} 
           .whitelistedSourceResources=${this.whitelistedSourceNetworks} evironment=${Environment.TESTNET}>
          </sygma-fungible-transfer>
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
