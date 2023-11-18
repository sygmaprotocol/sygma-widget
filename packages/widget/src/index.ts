import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './components';
import { ExternalProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import {
  Config,
  Environment,
  EthereumConfig,
  RawConfig,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

@customElement('sygma-widget')
export class MyWidget extends LitElement {
  @property({
    type: String
  })
  public environment?: Environment;

  @property({
    type: Object,
    hasChanged: (n, o) => n !== o
  })
  config: Config;

  @state()
  web3Provider?: Web3Provider;

  @state()
  domains?: RawConfig['domains'];

  @state()
  homechain?: EthereumConfig | SubstrateConfig;

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedNetworkChainId?: number;

  constructor() {
    super();
    this.web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    this.config = new Config();
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    if (this.web3Provider) {
      const network = await this.web3Provider.getNetwork();
      const { chainId } = network;

      await this.config?.init(chainId, Environment.TESTNET);

      this.domains = this.config?.environment.domains;

      this.homechain = this.config?.getSourceDomainConfig();

      this.requestUpdate();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const domainId = target.value;
    const seletedDomain = this.domains?.find(
      (domain) => domain.id === Number(domainId)
    );

    if (seletedDomain) {
      this.selectedNetworkChainId = seletedDomain.chainId;
      console.log('🚀  this.selectedNetwork:', this.selectedNetworkChainId);
      this.requestUpdate();
    }
  }

  render() {
    return html`<h1>My Widget ${this.config?.chainId}</h1>
      <div>Environment: ${this.config?.environment}</div>
      <div>
        <h2>Homechain</h2>
        <network-selector
          .isHomeChainSelector=${true}
          .domains=${this.domains}
          .homechain=${this.homechain}
          .direction=${'from'}
          .networkIcons=${true}
        ></network-selector>
      </div>
      <div>
        <h2>Destination chain</h2>
        <network-selector
          .domains=${this.domains}
          .onChange=${this.handleChange}
          .direction=${'to'}
          .selectedNetworkChainId=${this.selectedNetworkChainId}
          .networkIcons=${true}
        ></network-selector>
      </div>`;
  }
}
