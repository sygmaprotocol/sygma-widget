import type {
  EthereumConfig,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { switchNetworkIcon, sygmaLogo } from '../../assets';
import '../network-selector';
import '../amount-selector';
import type { WalletManagerController } from '../../controllers';
import { styles } from './styles';

@customElement('widget-view')
export class WidgetView extends LitElement {
  static styles = styles;
  @property({
    type: Number
  })
  chainId?: number;

  @property({
    type: Object
  })
  domains?: EthereumConfig[] | SubstrateConfig[];

  @property({
    type: Object
  })
  homechain?: EthereumConfig | SubstrateConfig;

  @property({
    type: Number
  })
  selectedNetworkChainId?: number;

  @property({
    type: Object
  })
  destinationDomains?: EthereumConfig[] | SubstrateConfig[];

  @property({
    type: Object
  })
  resources?: Resource[];

  @property({
    type: Number
  })
  selectedAmount?: number;

  @property({
    type: Object
  })
  selectedToken?: Pick<Resource, 'resourceId'>;

  @property({
    type: Object
  })
  handleTransfer?: (e: Event) => void;

  @property({
    type: Object
  })
  walletManager?: WalletManagerController;

  @property({
    type: Number
  })
  tokenBalance?: string;

  @state()
  connectionInitialized: boolean = false;

  initConnect = (): void => {
    this.connectionInitialized = true;
    dispatchEvent(
      new CustomEvent('connectionInitialized', {
        detail: { connectionInitialized: this.connectionInitialized },
        bubbles: true,
        composed: true
      })
    );
  };

  render(): HTMLTemplateResult {
    return html`
    <section class="widgetContainer">
        <form @submit=${this.handleTransfer}>
          <section class="switchNetwork">
            <span>${switchNetworkIcon}</span>
            <span>Switch Network</span>
          </section>
          <section>
          <network-selector
              .directionLabel=${'from'}
              .networkIcons=${true}
              .homechain=${this.homechain}
              .isHomechain=${true}
              .selectedNetworkChainId=${this.chainId}
              .disabled=${true}
            ></network-selector>
          </section>
          <section>
          <network-selector
              .domains=${this.destinationDomains}
              .directionLabel=${'to'}
              .networkIcons=${true}
              .selectedNetworkChainId=${this.selectedNetworkChainId}
            ></network-selector>
            </section>
          <section>
          <amount-selector
              .disabled=${false}
              .selectedNetworkChainId=${this.selectedNetworkChainId}
              .resources=${this.resources}
              .tokenBalance=${this.tokenBalance}
            >
            </amount-selector>
          </section>
          <section>
            Transfer to the same address
          </section>
          <section>
            ${when(
              !this.walletManager || !this.walletManager.accountData,
              () =>
                html`<button
                  @click=${this.initConnect}
                  type="button"
                  class="actionButton"
                >
                  Connect
                </button>`,
              () =>
                html`<button type="submit" class="actionButtonReady">
                  Transfer
                </button> `
            )}
          </section>
          <section class="poweredBy">
            <span>${sygmaLogo}</span>
            <span>Powered by Sygma</span>
          </section>
        </section>
        </form>
    `;
  }
}
