import { createContext, provide } from '@lit/context';
import type { Account, UnsubscribeFn } from '@polkadot-onboard/core';
import type { Signer } from '@polkadot/api/types';
import type { EIP1193Provider } from '@web3-onboard/core';
import type { HTMLTemplateResult } from 'lit';
import { Environment } from '@buildwithsygma/sygma-sdk-core';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { BaseComponent } from '../components/common/base-component';
import { SUBSTRATE_RPCS } from '../constants';
import { fetchParachainId } from '../utils/substrate';

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
  evmWallet?: EvmWallet;

  @property({ attribute: false })
  substrateProviders?: Array<ApiPromise> = [];

  @property({ type: String }) environment?: Environment;

  async connectedCallback(): Promise<void> {
    super.connectedCallback();
    if (this.evmWallet) {
      this.walletContext.evmWallet = this.evmWallet;
    }

    const substrateProviders = await this.getSubstrateProviders();

    this.substrateProviderContext = {
      substrateProviders: substrateProviders
    };

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

  private async getSubstrateProviders(): Promise<ParachainProviders> {
    const substrateProviders: ParachainProviders = new Map();
    const specifiedProviders = this.substrateProviders ?? [];
    const environment = this.environment ?? Environment.TESTNET;

    // create a id -> api map of all specified providers
    for (const provider of specifiedProviders) {
      try {
        const parachainId = await fetchParachainId(provider);
        console.log(`provided provider for ${parachainId}`);
        substrateProviders.set(parachainId, provider);
      } catch (error) {
        console.error('unable to fetch parachain id');
      }
    }

    // all chains hardcoded on ui
    // and create their providers
    // if not already specified by the user
    const parachainIds = Object.keys(SUBSTRATE_RPCS[environment]);
    for (const parachainId of parachainIds) {
      console.log(`creating default provider for ${parachainId}`);
      const _parachainId = parseInt(parachainId);

      if (!substrateProviders.has(_parachainId)) {
        const rpcUrls = SUBSTRATE_RPCS[environment][_parachainId];
        const provider = new WsProvider(rpcUrls);
        const api = new ApiPromise({ provider });

        try {
          await api.isReady;
          substrateProviders.set(_parachainId, api);
        } catch (error) {
          console.error('api error');
        }
      }
    }

    return substrateProviders;
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
