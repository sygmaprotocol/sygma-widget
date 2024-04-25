import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';
import type { WalletInit, AppMetadata } from '@web3-onboard/common';
import { sygmaLogo } from './assets';
import './components';
import './components/address-input';
import './components/resource-amount-selector';
import './components/transfer/fungible/fungible-token-transfer';
import './components/network-selector';
import './context/wallet';
import type {
  Eip1193Provider,
  ISygmaProtocolWidget,
  Theme,
  SdkInitializedEvent
} from './interfaces';
import { styles } from './styles';
import { BaseComponent } from './components/common';

@customElement('sygmaprotocol-widget')
class SygmaProtocolWidget
  extends BaseComponent
  implements ISygmaProtocolWidget
{
  static styles = styles;

  @property({ type: Array }) walletModules?: WalletInit[];

  @property({ type: String }) environment?: Environment;

  @property({ type: Array }) whitelistedSourceNetworks?: string[];

  @property({ type: Array }) whitelistedDestinationNetworks?: string[];

  @property({ type: Array }) whitelistedSourceResources?: string[];

  @property({ type: Object }) evmProvider?: Eip1193Provider;

  @property({ type: Array }) substrateProviders?: Array<ApiPromise>;

  @property({ type: Object }) substrateSigner?: Signer;

  @property({ type: Boolean }) show?: boolean;

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
          .walletModules=${this.walletModules}
          .substrateProviders=${this.substrateProviders}
          .environment=${this.environment}
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
                .environment=${this.environment as Environment}
                .onSourceNetworkSelected=${(domain: Domain) =>
                  (this.sourceNetwork = domain)}
                environment=${Environment.TESTNET}
                .whitelistedSourceNetworks=${this.whitelistedSourceNetworks}
                .whitelistedDestinationNetworks=${this
                  .whitelistedDestinationNetworks}
                .whitelistedSourceResources=${this.whitelistedSourceResources}
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
