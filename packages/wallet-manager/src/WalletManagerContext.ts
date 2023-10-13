import { provide, createContext } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import {
  type WalletManagerController as TWalletManagerController,
  WalletManagerController
} from './WalletManagerController';
import { ethers } from 'ethers';
import { ApiPromise } from '@polkadot/api';
import { SyntheticEventCreator } from './types';

export const WalletManagerContext = createContext<
  TWalletManagerController | undefined
>('wallet-context');

export const SyntheticEventCreatorContext =
  createContext<SyntheticEventCreator>('synthetic-event');

@customElement('wallet-manager-context')
export class WalletManagerContextProvider extends LitElement {
  @provide({ context: WalletManagerContext })
  @state()
  walletManagerController?: WalletManagerController;

  @provide({ context: SyntheticEventCreatorContext })
  @state()
  syntheticEventCreator: SyntheticEventCreator = (
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

  @property({ type: Object })
  web3Provider?: ethers.providers.Web3Provider;

  @property({ type: Object })
  apiPromise?: ApiPromise;

  @property({ type: String })
  wssProvider?: string;

  constructor() {
    super();
    this.walletManagerController = new WalletManagerController(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.web3Provider) {
      this.walletManagerController?.initFromWeb3Provider(this.web3Provider);
    } else if (this.apiPromise) {
      this.walletManagerController?.connectFromApiPromise(this.apiPromise!);
    } else if (this.wssProvider) {
      this.walletManagerController?.connectFromWssProvider(this.wssProvider!);
    } else {
      this.walletManagerController?.initFromWindow();
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
