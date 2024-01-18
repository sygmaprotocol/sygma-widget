import { createContext, provide } from '@lit/context';
import type { ApiPromise } from '@polkadot/api';
import type { ethers } from 'ethers';
import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  WalletManagerController,
  type WalletManagerController as TWalletManagerController
} from './WalletManagerController';
import { Network } from './types';

export const WalletManagerContext = createContext<
  TWalletManagerController | undefined
>('wallet-context');

export const AccountContext = createContext<string | undefined>(
  'account-context'
);

/**
 * @name WalletManagerContextProvider
 * @description This component is responsible for providing the WalletManagerController as a context to all its children.
 * It also provides a synthetic event creator function that can be used to dispatch custom events.
 * @example
 * For you to consume the context objects, you need to wrap up your component with the wallet-manager-context on your render method.
 * You can either pass a web3Provider, an apiPromise or a wssConnectionUrl to the component.
 *
 * Passing a web3Provider and an apiPromise
 * <wallet-manager-context
 *   .web3Provider=${web3Provider}
 *   .apiPromise=${apiPromise}
 * >
 *    <your-component></your-component>
 * </wallet-manager-context>
 *
 * Passing a wssConnectionUrl
 * <wallet-manager-context
 *  .wssConnectionUrl=${wssConnectionUrl}
 * >
 *   <your-component></your-component>
 * </wallet-manager-context>
 */
@customElement('wallet-manager-context-provider')
export class WalletManagerContextProvider extends LitElement {
  @provide({ context: WalletManagerContext })
  @state()
  walletManagerController?: WalletManagerController;

  @property({ type: Object })
  web3Provider?: ethers.providers.Web3Provider;

  @property({ type: Object })
  apiPromise?: ApiPromise;

  @property({ type: String })
  wssConnectionUrl?: string;

  @property({ type: String })
  network: Network;

  constructor() {
    super();
    this.network = Network.EVM;
  }

  connectedCallback(): void {
    this.walletManagerController = new WalletManagerController(
      this,
      this.network,
      {
        web3Provider: this.web3Provider,
        apiPromise: this.apiPromise,
        wssConnectionUrl: this.wssConnectionUrl
      }
    );
  }

  render(): HTMLTemplateResult {
    return html` <slot></slot>`;
  }
}
