import {
  Config,
  Domain,
  Environment,
  EthereumConfig,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import './network-selector';
import './amount-selector';

@customElement('my-widget')
export default class MyElement extends LitElement {
  @state({
    hasChanged: (n, o) => {
      return n !== o;
    }
  })
  domains?: EthereumConfig[] | SubstrateConfig[];

  @state({
    hasChanged: (n, o) => {
      return n !== o;
    }
  })
  resources?: Resource[];

  @state({
    hasChanged: (n, o) => {
      console.log('changed on chain id', n, o);
      return n !== o;
    }
  })
  selectedNetworkChainId?: number;

  @state({
    hasChanged: (n, o) => {
      return n !== o;
    }
  })
  selectedDomain?: Domain;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    const config = new Config();
    await config.init(5, Environment.TESTNET);

    const domains = config.getDomains();
    this.domains = domains as EthereumConfig[] | SubstrateConfig[];

    const resources = config.getDomainResources();

    const fungibleResources = resources.filter(
      (resource) => resource.type === 'fungible'
    );

    this.resources = fungibleResources;

    addEventListener('amount-selector-change', (event: unknown) => {
      const { detail } = event as CustomEvent;
      console.log('amount-selector-change', detail);
    });
  }

  render() {
    return html`
      <network-selector
        .domains=${this.domains}
        .directionLabel=${'from'}
        .networkIcons=${true}
      ></network-selector>
      <amount-selector
        .resources=${this.resources}
        .isNativeToken=${true}
        .selectedDomain=${this.selectedDomain}
        .selectedNetworkChainId=${5}
      ></amount-selector>
    `;
  }
}
