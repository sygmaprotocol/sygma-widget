import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  EthereumConfig,
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
  domains?: EthereumConfig[] | SubstrateConfig[];

  @property({
    type: Boolean
  })
  isHomechain = false;

  @property({
    type: Object,
    hasChanged: (n, o) => n !== o
  })
  homechain?: EthereumConfig | SubstrateConfig;

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

  @property({
    type: Boolean
  })
  disabled = false;

  render() {
    return html`
      <div class="selectorContainer">
        <label for="network-selector" class="directionLabel"
          >${this.directionLabel && directions[this.directionLabel]}</label
        >
        <base-selector
          class="baseSelector"
          id="network-selector"
          .isHomechain=${this.isHomechain}
          .homechain=${this.homechain}
          .entries=${this.domains}
          .typeSelector=${'network'}
          .networkIcons=${this.networkIcons}
          .selectedNetworkChainId=${this.selectedNetworkChainId}
          .disabled=${this.disabled}
        ></base-selector>
      </div>
    `;
  }
}
