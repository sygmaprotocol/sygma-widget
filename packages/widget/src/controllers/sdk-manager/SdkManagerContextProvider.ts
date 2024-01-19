import type { Environment } from '@buildwithsygma/sygma-sdk-core';
import { consume, createContext, provide } from '@lit/context';
import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { WalletManagerController } from '..';
import { WalletManagerContext } from '..';
import { SdkManager } from './SdkManager';
import type { SdkManagerState } from './types';

export const SdkManagerContext = createContext<SdkManagerState | undefined>(
  'sdk-context'
);

/**
 * @name SdkManagerContextProvider
 * @description This component is responsible for providing the SdkManagerController as a context to all its children.
 *
 * @example
 * For you to consume the context objects, you need to wrap up your component with the sdk-manager-context on your render method.
 *
 * <wallet-manager-context>
 *   <sdk-manager-context-provider>
 *     <your-component></your-component>
 *   </sdk-manager-context-provider>
 * </wallet-manager-context>
 */

@customElement('sdk-manager-context-provider')
export class SdkManagerContextProvider extends LitElement {
  @consume({ context: WalletManagerContext, subscribe: true })
  @state()
  walletManager?: WalletManagerController;

  @provide({ context: SdkManagerContext })
  @state()
  sdkManager?: SdkManager;

  constructor() {
    super();
    this.sdkManager = new SdkManager();
  }

  async initializeSdk(env?: Environment): Promise<void> {
    if (!this.walletManager?.provider) {
      throw new Error('No wallet connected');
    }

    await this.sdkManager?.initializeSdk(this.walletManager.provider, env);
  }

  async initializeTransfer(
    fromAddress: string,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: string
  ): Promise<void> {
    if (!this.walletManager?.provider) {
      throw new Error('No wallet connected');
    }

    if (!this.sdkManager) {
      throw new Error('SdkManager not initialized');
    }

    if (this.sdkManager.status !== 'initialized') {
      throw new Error('SdkManager not initialized');
    }

    await this.sdkManager.initializeTransfer(
      fromAddress,
      destinationChainId,
      destinationAddress,
      resourceId,
      amount
    );
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.walletManager?.addAccountChangedEventListener(() => {
      this.requestUpdate();
    });

    this.walletManager?.addChainChangedEventListener(() => {
      const provider = this.walletManager?.evmWallet?.web3Provider;
      if (provider) {
        void this.sdkManager?.checkSourceNetwork(provider);
      }
      this.requestUpdate();
    });
  }

  render(): HTMLTemplateResult {
    return html`<slot></slot>`;
  }
}
