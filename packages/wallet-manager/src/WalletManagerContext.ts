import { provide, createContext } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type WalletManagerController as TWalletManagerController,
  WalletManagerController
} from './WalletManagerController';
import { ethers } from 'ethers';
import { ApiPromise } from '@polkadot/api';
import { SinteticEventCreator } from './types';

export const WalletManagerContext = createContext<
  TWalletManagerController | undefined
>('wallet-context');

export const SinteticEventCreatorContext =
  createContext<SinteticEventCreator>('sintetic-event');

@customElement('wallet-manager-context')
export class WalletManagerContextProvider extends LitElement {
  @provide({ context: WalletManagerContext })
  @state()
  walletManagerController?: WalletManagerController;

  @provide({ context: SinteticEventCreatorContext })
  @state()
  sinteticEventCreator: SinteticEventCreator = (
    eventName: string,
    dataToPass: unknown
  ) => {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: dataToPass
    });

    this.dispatchEvent(event);
  };

  @property({ type: String })
  chainId?: string;

  @property({ type: Object })
  web3Provider?: ethers.providers.Web3Provider;

  @property({ type: Object })
  apiPromise?: ApiPromise;

  constructor() {
    super();
    this.walletManagerController = new WalletManagerController(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.web3Provider) {
      this.walletManagerController?.initFromWeb3Provider(this.web3Provider);
    }
  }

  render() {
    return html` <slot></slot>`;
  }
}
