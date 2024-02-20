import { customElement, property } from 'lit/decorators.js';
import { createContext, provide } from '@lit/context';
import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import type { AppMetadata } from '@web3-onboard/common';
import { BaseComponent } from '../components/common/base-component';
import type { Theme } from '../interfaces';

export interface ConfigContext {
  theme?: Theme;
  walletConnectOptions?: WalletConnectOptions;
  appMetaData?: AppMetadata;
}

export const configContext = createContext<ConfigContext>(
  Symbol('sygma-config-context')
);

declare global {
  interface HTMLElementEventMap {
    configUpdate: ConfigUpdateEvent;
  }
}

export class ConfigUpdateEvent extends CustomEvent<Partial<ConfigContext>> {
  constructor(update: Partial<ConfigContext>) {
    super('configUpdate', { detail: update, composed: true, bubbles: true });
  }
}

@customElement('sygma-config-context-provider')
export class ConfigContextProvider extends BaseComponent {
  @provide({ context: configContext })
  private configContext: ConfigContext = {};

  @property({ attribute: false, type: Object })
  walletConnectOptions?: WalletConnectOptions;

  @property({ attribute: false, type: Object })
  appMetadata?: AppMetadata;

  @property({ attribute: false, type: Object })
  theme?: Theme;

  connectedCallback(): void {
    super.connectedCallback();

    this.configContext = {
      theme: this.theme,
      walletConnectOptions: this.walletConnectOptions,
      appMetaData: this.appMetadata
    };

    this.addEventListener('configUpdate', (event: ConfigUpdateEvent) => {
      this.configContext = {
        ...this.configContext,
        ...event.detail
      };
    });
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
