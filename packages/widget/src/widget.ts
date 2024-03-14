import type {
  Domain,
  EvmResource,
  SubstrateResource
} from '@buildwithsygma/sygma-sdk-core';
import { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';
import type { AppMetadata } from '@web3-onboard/common';
import { sygmaLogo } from './assets';
import './components';
import './components/address-input';
import './components/amount-selector';
import { BaseComponent } from './components/common/base-component';
import './components/transfer/fungible/fungible-token-transfer';
import './components/network-selector';
import './context/wallet';
import type {
  Eip1193Provider,
  ISygmaProtocolWidget,
  SdkInitializedEvent,
  Theme
} from './interfaces';
import { styles } from './styles';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget
  extends BaseComponent
  implements ISygmaProtocolWidget
{
  static styles = styles;

  @property({ type: String }) environment?: Environment;

  @property({ type: Array }) whitelistedSourceNetworks?: string[];

  @property({ type: Array }) whitelistedDestinationNetworks?: string[];

  @property({ type: Object }) evmProvider?: Eip1193Provider;

  @property({ type: Array }) substrateProviders?: Array<{
    domainId: number;
    api: ApiPromise;
  }>;

  @property({ type: Object }) substrateSigner?: Signer;

  @property({ type: Boolean }) show?: boolean;

  @property({ type: Array }) whitelistedSourceResources?: Array<
    EvmResource | SubstrateResource
  >;

  @property({ type: Boolean }) expandable?: boolean;

  @property({ type: Boolean }) darkTheme?: boolean;

  @property({ type: Object }) customLogo?: SVGElement;

  @property({ type: Object }) theme?: Theme;

  @property({ type: Object }) walletConnectOptions?: WalletConnectOptions;

  @property({ type: Object }) appMetadata?: AppMetadata;

  @state()
  private isLoading = false;

  @state()
  private sdkInitialized = false;

  @state()
  private sourceNetwork?: Domain;

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

  connectedCallback(): void {
    super.connectedCallback();
    const env = import.meta.env.VITE_BRIDGE_ENV ?? Environment.MAINNET;
    if (Object.values(Environment).includes(env as Environment)) {
      this.environment = env as Environment;
    } else {
      throw new Error(
        `Invalid environment value, please choose following: ${Object.values(Environment).join(', ')}`
      );
    }
  }

  render(): HTMLTemplateResult {
    return html`
      <sygma-config-context-provider
        .appMetadata=${this.appMetadata}
        .theme=${this.theme}
        .walletConnectOptions=${this.walletConnectOptions}
      >
        <sygma-wallet-context-provider
          .substrateProviders=${this.substrateProviders}
        >
          <section
            class="widgetContainer ${this.isLoading ? 'noPointerEvents' : ''}"
          >
            <section class="widgetHeader">
              <div class="brandLogoContainer title">[Brand] Transfer</div>
              ${this.renderConnect()}
            </section>
            <section class="widgetContent">
              <sygma-fungible-transfer
                @sdk-initialized=${(event: SdkInitializedEvent) =>
                  (this.sdkInitialized = event.detail.hasInitialized)}
                .onSourceNetworkSelected=${(domain: Domain) =>
                  (this.sourceNetwork = domain)}
                .whitelistedSourceResources=${this.whitelistedSourceNetworks}
                environment=${Environment.TESTNET}
              >
              </sygma-fungible-transfer>
            </section>
            <section class="poweredBy">${sygmaLogo} Powered by Sygma</section>
            ${when(
              this.isLoading || !this.sdkInitialized,
              () => html`<sygma-overlay-component></sygma-overlay-component>`
            )}
          </section>
        </sygma-wallet-context-provider>
      </sygma-config-context-provider>
    `;
  }
}

export { SygmaProtocolWidget };

declare global {
  interface HTMLElementTagNameMap {
    'sygmaprotocol-widget': ISygmaProtocolWidget;
  }
}
