import { createContext, provide } from '@lit/context';
import type { Account, UnsubscribeFn } from '@polkadot-onboard/core';
import type { Signer } from '@polkadot/api/types';
import type { u32 } from '@polkadot/types-codec';
import type { EIP1193Provider } from '@web3-onboard/core';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ApiPromise } from '@polkadot/api';
import type { PropertyValues } from '@lit/reactive-element';
import { BaseComponent } from '../components/common/base-component';

export interface EvmWallet {
  address: string;
  providerChainId: number;
  provider: EIP1193Provider;
}

export interface SubstrateWallet {
  signer: Signer;
  signerAddress: string;
  accounts: Account[];
  unsubscribeSubstrateAccounts?: UnsubscribeFn;
  disconnect?: () => Promise<void>;
}

export interface WalletContext {
  evmWallet?: EvmWallet;
  substrateWallet?: SubstrateWallet;
}

export enum WalletContextKeys {
  EVM_WALLET = 'evmWallet',
  SUBSTRATE_WALLET = 'substrateWallet'
}

export type ParachainId = number;
export type ParachainProviders = Map<ParachainId, ApiPromise>;

export interface SubstrateProviderContext {
  substrateProviders?: ParachainProviders;
}

declare global {
  interface HTMLElementEventMap {
    walletUpdate: WalletUpdateEvent;
  }
}

export const walletContext = createContext<WalletContext>(
  Symbol('sygma-wallet-context')
);

export const substrateProviderContext = createContext<SubstrateProviderContext>(
  Symbol('substrate-provider-context')
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

  @provide({ context: substrateProviderContext })
  substrateProviderContext: SubstrateProviderContext = {};

  @property({ attribute: false, type: Object })
  evmWalllet?: EvmWallet;

  @property({ attribute: false })
  substrateProviders?: Array<ApiPromise> = [];

  /**
   * Creates a provider map w.r.t parachain ids
   * @param {Array<ApiPromise>} providers array of {@link ApiPromise}
   * @returns {Promise<ParachainProviders>}
   */
  async createProvidersMap(
    providers: Array<ApiPromise>
  ): Promise<ParachainProviders> {
    const map: ParachainProviders = new Map();

    for (const provider of providers) {
      try {
        // TODO: use polkadot type augmentation to remove "as 32"
        const parachainId = await provider.query.parachainInfo.parachainId();
        const _parachainId = (parachainId as u32).toNumber();
        map.set(_parachainId, provider);
      } catch (error) {
        console.error(error);
      }
    }

    return map;
  }

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    if (this.evmWalllet) {
      this.walletContext.evmWallet = this.evmWalllet;
    }

    if (this.substrateProviders) {
      const providersMap = await this.createProvidersMap(
        this.substrateProviders
      );

      this.substrateProviderContext = {
        substrateProviders: providersMap
      };
    }

    this.addEventListener('walletUpdate', (event: WalletUpdateEvent) => {
      this.walletContext = {
        ...this.walletContext,
        ...event.detail
      };
      if (this.walletContext.evmWallet?.provider) {
        this.walletContext.evmWallet?.provider.on(
          'chainChanged',
          this.onEvmChainChanged
        );
        this.walletContext.evmWallet?.provider.on(
          'accountsChanged',
          this.onEvmAccountChanged
        );
      }
    });
  }

  // since we provider as property from widget
  protected async updated(
    changedProperties: PropertyValues<this>
  ): Promise<void> {
    if (changedProperties.has('substrateProviders')) {
      if (this.substrateProviders) {
        const providers = await this.createProvidersMap(
          this.substrateProviders
        );

        this.substrateProviderContext = {
          substrateProviders: providers
        };
      }
    }
  }

  disconnectedCallback(): void {
    if (this.walletContext.evmWallet?.provider) {
      this.walletContext.evmWallet?.provider.removeListener(
        'chainChanged',
        this.onEvmChainChanged
      );
      this.walletContext.evmWallet?.provider.removeListener(
        'accountsChanged',
        this.onEvmChainChanged
      );
    }
  }

  private onEvmChainChanged = (chainId: string): void => {
    if (this.walletContext.evmWallet) {
      this.walletContext = {
        ...this.walletContext,
        evmWallet: {
          ...this.walletContext.evmWallet,
          providerChainId: parseInt(chainId)
        }
      };
    }
  };

  private onEvmAccountChanged = (accounts: string[]): void => {
    if (accounts.length === 0) {
      this.walletContext = {
        ...this.walletContext,
        evmWallet: undefined
      };
    }
    if (this.walletContext.evmWallet) {
      this.walletContext = {
        ...this.walletContext,
        evmWallet: {
          ...this.walletContext.evmWallet,
          address: accounts[0]
        }
      };
    }
  };

  protected render(): HTMLTemplateResult {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-wallet-context-provider': WalletContextProvider;
  }
}
