import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import type { Account } from '@polkadot-onboard/core';
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import type { ReactiveController, ReactiveElement } from 'lit';

import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';
import type { AppMetadata } from '@web3-onboard/common';
import { utils } from 'ethers';
import { WalletUpdateEvent, walletContext } from '../../context';
import type { Eip1193Provider } from '../../interfaces';

type ChainData = {
  chainId: number;
  name: string;
  rpc: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
};

type ChainDataResponse = Array<ChainData>;

export class WalletController implements ReactiveController {
  host: ReactiveElement;

  walletContext: ContextConsumer<typeof walletContext, ReactiveElement>;

  constructor(host: ReactiveElement) {
    (this.host = host).addController(this);
    this.walletContext = new ContextConsumer(host, {
      context: walletContext,
      subscribe: true
    });
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    const substrateWallet = this.walletContext.value?.substrateWallet;
    if (substrateWallet) {
      substrateWallet.unsubscribeSubstrateAccounts?.();
    }
  }

  connectWallet = (
    network: Domain,
    options?: {
      walletConnectOptions?: WalletConnectOptions;
      appMetaData?: AppMetadata;
    }
  ): void => {
    switch (network.type) {
      case Network.EVM:
        {
          void this.connectEvmWallet(network, options);
        }
        break;
      case Network.SUBSTRATE:
        {
          void this.connectSubstrateWallet(network, options);
        }
        break;
      default:
        throw new Error('Unsupported network type');
    }
  };

  disconnectWallet = (): void => {
    this.disconnectEvmWallet();
    this.disconnectSubstrateWallet();
  };

  disconnectEvmWallet = (): void => {
    const evmWallet = this.walletContext.value?.evmWallet;
    if (evmWallet) {
      this.host.dispatchEvent(
        new WalletUpdateEvent({
          evmWallet: undefined
        })
      );
    }
  };

  disconnectSubstrateWallet = (): void => {
    const substrateWallet = this.walletContext.value?.substrateWallet;
    if (substrateWallet) {
      substrateWallet.unsubscribeSubstrateAccounts?.();
      void substrateWallet.disconnect?.();
      this.host.dispatchEvent(
        new WalletUpdateEvent({
          substrateWallet: undefined
        })
      );
    }
  };

  async switchChain(chainId: number): Promise<void> {
    if (this.walletContext.value?.evmWallet) {
      try {
        await this.walletContext.value.evmWallet.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: utils.hexValue(chainId) }]
        });
      } catch (switchError) {
        console.log(
          'env',
          import.meta.env.VITE_CHAIN_ID_URL,
          import.meta.env.VITE_BRIDGE_ENV
        );
        const chainData = (await (
          await fetch(import.meta.env.VITE_CHAIN_ID_URL)
        ).json()) as ChainDataResponse;

        const selectedChain = chainData.find(
          (chain) => chain.chainId === chainId
        ) as ChainData;

        void this.addEvmChain(
          selectedChain,
          this.walletContext.value.evmWallet.provider
        );
      }
    }
  }

  connectEvmWallet = async (
    network: Domain,
    options?: {
      walletConnectOptions?: WalletConnectOptions;
      appMetaData?: AppMetadata;
    }
  ): Promise<void> => {
    const injected = injectedModule();

    const walletSetup = [injected];

    if (options?.walletConnectOptions?.projectId) {
      walletSetup.push(walletConnectModule(options.walletConnectOptions));
    }

    const onboard = Onboard({
      appMetadata: options?.appMetaData,
      wallets: walletSetup,
      chains: [
        {
          id: network.chainId
        }
      ],
      accountCenter: {
        desktop: { enabled: false },
        mobile: { enabled: false }
      }
    });

    const wallets = await onboard.connectWallet();
    if (wallets[0]) {
      const provider = wallets[0].provider;
      const providerChainId = parseInt(
        await provider.request({ method: 'eth_chainId' })
      );
      this.host.dispatchEvent(
        new WalletUpdateEvent({
          evmWallet: {
            address:
              wallets[0].accounts[0].ens?.name ??
              wallets[0].accounts[0].address,
            providerChainId,
            provider
          }
        })
      );
      if (network.chainId !== providerChainId) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: utils.hexValue(network.chainId) }]
          });
        } catch (switchError) {
          const { chainId } = network;

          const chainData = (await (
            await fetch(import.meta.env.VITE_CHAIN_ID_URL)
          ).json()) as ChainDataResponse;

          const selectedChain = chainData.find(
            (chain) => chain.chainId === chainId
          ) as ChainData;

          void this.addEvmChain(selectedChain, provider);
        }
      }
      this.host.requestUpdate();
    }
  };

  connectSubstrateWallet = async (
    _network: Domain, // TODO: remove underscore prefix once arg usage is added
    options?: {
      walletConnectOptions?: WalletConnectOptions;
      appMetaData?: AppMetadata;
    }
  ): Promise<void> => {
    const injectedWalletProvider = new InjectedWalletProvider(
      { disallowed: [] },
      options?.appMetaData?.name ?? 'Sygma Widget'
    );
    const wallets = await injectedWalletProvider.getWallets();

    //TODO: UI for selecting substrate wallet

    const wallet = wallets[0];
    await wallet.connect();
    if (wallet.signer) {
      const accounts = await wallet.getAccounts();
      const unsub = await wallet.subscribeAccounts(
        this.onSubstrateAccountChange
      );
      this.host.dispatchEvent(
        new WalletUpdateEvent({
          substrateWallet: {
            signer: wallet.signer,
            accounts,
            unsubscribeSubstrateAccounts: unsub,
            disconnect: wallet.disconnect
          }
        })
      );
    }
  };

  sourceNetworkUpdated(sourceNetwork: Domain | undefined): void {
    if (!sourceNetwork) {
      this.disconnectEvmWallet();
      this.disconnectSubstrateWallet();
    }
    switch (sourceNetwork?.type) {
      case Network.SUBSTRATE:
        {
          this.disconnectEvmWallet();
        }
        break;
      case Network.EVM:
        {
          this.disconnectSubstrateWallet();
        }
        break;
      default:
        return;
    }
  }

  private onSubstrateAccountChange = (accounts: Account[]): void => {
    if (this.walletContext.value?.substrateWallet && accounts.length !== 0) {
      this.host.dispatchEvent(
        new WalletUpdateEvent({
          substrateWallet: {
            signer: this.walletContext.value.substrateWallet.signer,
            disconnect: this.walletContext.value.substrateWallet.disconnect,
            unsubscribeSubstrateAccounts:
              this.walletContext.value.substrateWallet
                .unsubscribeSubstrateAccounts,
            //TODO: convert address to network format
            accounts
          }
        })
      );
    }
    if (accounts.length === 0) {
      this.disconnectSubstrateWallet();
    }
  };

  private async addEvmChain(
    chainData: ChainData,
    provider: Eip1193Provider
  ): Promise<void> {
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainData.chainId.toString(16)}`,
            chainName: chainData.name,
            rpcUrls: [chainData.rpc[0]],
            nativeCurrency: {
              name: chainData.nativeCurrency.name,
              symbol: chainData.nativeCurrency.symbol,
              decimals: chainData.nativeCurrency.decimals
            }
          }
        ]
      });
    } catch (addeError) {
      console.error(addeError);
    }
  }
}
