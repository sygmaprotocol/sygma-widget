import { customElement, property } from 'lit/decorators.js';
import { ContextProvider, createContext } from '@lit/context';
import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';
import type { HTMLTemplateResult, PropertyValues } from 'lit';
import { html } from 'lit';
import type { AppMetadata, WalletInit } from '@web3-onboard/common';
import type { Theme } from '../interfaces';
import { BaseComponent } from '../components/common/base-component';

export interface ConfigContext {
  theme?: Theme;
  walletConnectOptions?: WalletConnectOptions;
  appMetaData?: AppMetadata;
  walletModules?: WalletInit[];
  whitelistedSourceNetworks?: string[];
  whitelistedDestinationNetworks?: string[];
  whitelistedSourceResources?: string[];
}

export const configContext = createContext<ConfigContext>(
  Symbol('sygma-config-context')
);

@customElement('sygma-config-context-provider')
export class ConfigContextProvider extends BaseComponent {
  private configContextProvider = new ContextProvider(this, {
    context: configContext,
    initialValue: {}
  });

  @property({ attribute: false, type: Object })
  walletConnectOptions?: WalletConnectOptions;

  @property({ attribute: false, type: Object })
  appMetadata?: AppMetadata;

  @property({ type: Array })
  walletModules?: WalletInit[];

  @property({ attribute: false, type: Object })
  theme?: Theme;

  connectedCallback(): void {
    super.connectedCallback();

    this.configContextProvider.setValue({
      theme: this.theme,
      walletConnectOptions: this.walletConnectOptions,
      appMetaData: this.appMetadata,
      walletModules: this.walletModules
    });
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('theme')) {
      this.configContextProvider.setValue({
        ...this.configContextProvider.value,
        theme: this.theme
      });
    }
  }

  protected render(): HTMLTemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementEventMap {
    'sygma-config-context-provider': ConfigContextProvider;
  }
}
