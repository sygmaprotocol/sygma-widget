import { Environment } from '@buildwithsygma/sygma-sdk-core';
import { consume, createContext, provide } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  WalletManagerContext,
  WalletManagerController
} from '@buildwithsygma/sygmaprotocol-wallet-manager';
import { SdkManagerState } from './types';
import { SdkManager } from './SdkManager';

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

  async initialize(env?: Environment) {
    if (!this.walletManager?.provider) {
      throw new Error('No wallet connected');
    }

    await this.sdkManager?.initialize(this.walletManager.provider, env);
  }

  async createTransfer(
    fromAddress: string,
    destinationChainId: number,
    destinationAddress: string,
    resourceId: string,
    amount: string
  ) {
    if (!this.walletManager?.provider) {
      throw new Error('No wallet connected');
    }

    if (!this.sdkManager) {
      throw new Error('SdkManager not initialized');
    }

    if (this.sdkManager.status !== 'initialized') {
      throw new Error('SdkManager not initialized');
    }

    await this.sdkManager.createTransfer(
      fromAddress,
      destinationChainId,
      destinationAddress,
      resourceId,
      amount
    );
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    this.walletManager?.addAccountChangedEventListener(() => {
      this.requestUpdate();
    });

    this.walletManager?.addChainChangedEventListener(async () => {
      const provider = this.walletManager?.evmWallet?.web3Provider;
      if (provider) {
        this.sdkManager?.checkSourceNetwork(provider);
      }
      this.requestUpdate();
    });
  }

  render() {
    return html`<slot></slot>`;
  }
}
