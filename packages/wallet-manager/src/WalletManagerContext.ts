import { provide, createContext } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type WalletManagerController as TWalletManagerController,
  WalletManagerController
} from './WalletManagerController';
import { ethers } from 'ethers';
import { ApiPromise } from '@polkadot/api';
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
  networks: Network;

  constructor() {
    super();
    this.networks = Network.EVM;
  }

  connectedCallback(): void {
    this.walletManagerController = new WalletManagerController(
      this,
      this.networks,
      {
        web3Provider: this.web3Provider,
        apiPromise: this.apiPromise,
        wssConnectionUrl: this.wssConnectionUrl
      }
    );
  }

  render() {
    return html` <slot></slot>`;
  }
}
