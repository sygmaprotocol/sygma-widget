import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  EthereumConfig,
  RawConfig,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import { styles } from './styles';
import '../base-selector';

const directions = {
  from: 'From',
  to: 'To'
};

@customElement('network-selector')
export default class NetworkSelector extends LitElement {
  static styles = styles;

  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  domains?: RawConfig['domains'];

  @property({
    type: Boolean
  })
  isHomechainSelector = false;

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
  directionLabel?: 'from' | 'to';

  @property({
    type: Number,
    hasChanged: (n, o) => n !== o
  })
  selectedNetworkChainId?: number;

  @property({
    type: Boolean
  })
  networkIcons = false;

  connectedCallback(): void {
    super.connectedCallback();
    addEventListener('network-change', (event: unknown) => {
      const { detail } = event as CustomEvent;
      this.selectedNetworkChainId = Number(detail);
    });
  }

  render() {
    return html`
      <div class="selectorContainer">
        <label for="network-selector" class="directionLabel"
          >${this.directionLabel && directions[this.directionLabel]}</label
        >
        <base-selector
          class="baseSelector"
          id="network-selector"
          .entries=${this.domains}
          .typeSelector=${'network'}
          .networkIcons=${this.networkIcons}
          .selectedNetworkChainId=${this.selectedNetworkChainId}
        ></base-selector>
      </div>
    `;
  }
}
