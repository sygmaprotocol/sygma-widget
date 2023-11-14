import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  EthereumConfig,
  RawConfig,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import {
  noNetworkIcon,
  ethereumIcon,
  polygonIcon,
  baseNetworkIcon,
  cronosNetworkIcon,
  phalaNetworkIcon,
  khalaNetworkIcon
} from './assets';

const directions = {
  from: 'From',
  to: 'To'
};

@customElement('network-selector')
export default class NetworkSelector extends LitElement {
  // move this to its own file
  static styles = css`
    .selectorContainer {
      border-radius: 24px;
      border: 1px solid var(--zinc-200, #e4e4e7);
      display: flex;
      width: 314px;
      padding: 12px 16px;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      gap: 4px;
    }
    .directionLabel {
      color: var(--zinc-400, #a1a1aa);
      font-family: Inter;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1 0 0;
      align-self: stretch;
    }
    .selectorSection {
      display: flex;
      align-items: center;
      gap: 12px;
      align-self: stretch;
      width: inherit;
    }
    .selector {
      width: inherit;
      color: var(--neutral-600, #525252);
      font-family: Inter;
      font-size: 18px;
      font-style: normal;
      font-weight: 500;
      line-height: 26px;
      border: none;
    }
  `;

  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  domains?: RawConfig['domains'];

  @property({
    type: Boolean
  })
  isHomeChainSelector = false;

  @property({
    type: Object,
    hasChanged: (n, o) => n !== o
  })
  homechain?: EthereumConfig | SubstrateConfig;

  @property({
    type: Object
  })
  onChange?: (event: Event) => void;

  @property({
    type: String
  })
  direction?: 'from' | 'to';

  @property({
    type: String,
    hasChanged: (n, o) => n !== o
  })
  selectedNetwork?: string;

  @property({
    type: Boolean
  })
  networkIcons = false;

  renderHomechainOptions() {
    return html`<option
      value="${ifDefined(this.homechain?.id)}"
      ?selected="${!!this.homechain?.id}"
    >
      ${this.homechain?.name}
    </option>`;
  }

  renderNetworkOptions() {
    return html`${map(this.domains, (domain, idx) => {
      if (idx === 0) {
        return html`
          <option
            value="${domain.id}"
            ?selected="${this.homechain?.id === domain.id}"
          >
            Network
          </option>
          <option value="${domain.id}" P>${domain.name}</option>
        `;
      }
      return html`
        <option
          value="${domain.id}"
          ?selected="${this.homechain?.id === domain.id}"
        >
          ${domain.name}
        </option>
      `;
    })}`;
  }

  // move this to utils
  renderNetworkIcon() {
    switch (this.selectedNetwork) {
      case 'ethereum':
      case 'goerli':
      case 'sepolia':
      case 'holesky':
        return html`${ethereumIcon}`;
      case 'polygon':
      case 'mumbai':
        return html`${polygonIcon}`;
      case 'base':
        return html`${baseNetworkIcon}`;
      case 'cronos':
        return html`${cronosNetworkIcon}`;
      case 'phala':
      case 'rococo-phala':
        return html`${phalaNetworkIcon}`;
      case 'khala':
        return html`${khalaNetworkIcon}`;
      default:
        return html`${noNetworkIcon}`;
    }
  }

  updated(): void {
    if (this.isHomeChainSelector && this.homechain) {
      this.selectedNetwork = this.homechain.name;
    }
  }

  render() {
    return html`
      <div class="selectorContainer">
        <label for="network-selector" class="directionLabel"
          >${this.direction && directions[this.direction]}</label
        >
        <section class="selectorSection">
          ${when(
            this.networkIcons,
            () => html`<div>${this.renderNetworkIcon()}</div>`,
            () => null // do not render network icon slot
          )}
          <select
            @change=${this.onChange}
            ?disabled=${this.isHomeChainSelector}
            id="network-selector"
            class="selector"
          >
            ${when(
              this.homechain,
              () => this.renderHomechainOptions(),
              () => this.renderNetworkOptions()
            )}
          </select>
        </section>
      </div>
    `;
  }
}
