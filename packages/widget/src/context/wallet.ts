import type { Web3Provider } from '@ethersproject/providers';
import { createContext, provide } from '@lit/context';
import type { Account, UnsubscribeFn } from '@polkadot-onboard/core';
import type { Signer } from '@polkadot/api/types';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { BaseComponent } from '../components/common/base-component/base-component';

export interface EvmWallet {
  address: string;
  provider: Web3Provider;
}

export interface SubstrateWallet {
  signer: Signer;
  accounts: Account[];
  unsubscribeSubstrateAccounts?: UnsubscribeFn;
  disconnect?: () => Promise<void>;
}

export interface WalletContext {
  evmWallet?: EvmWallet;
  substrateWallet?: SubstrateWallet;
}

declare global {
  interface HTMLElementEventMap {
    walletUpdate: WalletUpdateEvent;
  }
}

export const walletContext = createContext<WalletContext>(
  Symbol('sygma-wallet-context')
);

export class WalletUpdateEvent extends CustomEvent<WalletContext> {
  constructor(update: Partial<WalletContext>) {
    super('walletUpdate', { detail: update, composed: true, bubbles: true });
  }
}

@customElement('sygma-wallet-context-provider')
export class WalletContextProvider extends BaseComponent {
  //TODO: add properties to allow widget to pass external provider/signers.

  @provide({ context: walletContext })
  private walletContext: WalletContext = {};

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('walletUpdate', (event: WalletUpdateEvent) => {
      this.walletContext = {
        ...this.walletContext,
        ...event.detail
      };
    });
  }

  protected render(): HTMLTemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-wallet-context-provider': WalletContextProvider;
  }
}
