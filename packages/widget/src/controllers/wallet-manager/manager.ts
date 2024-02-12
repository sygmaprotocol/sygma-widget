import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import type { Account } from '@polkadot-onboard/core';
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import type { ReactiveController, ReactiveElement } from 'lit';
import { WalletUpdateEvent, walletContext } from '../../context';

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
    const evmWallet = this.walletContext.value?.evmWallet;
    if (evmWallet) {
      evmWallet.provider.removeListener(
        'accountsChanged',
        this.onEvmAccountChange
      );
    }
    const substrateWallet = this.walletContext.value?.substrateWallet;
    if (substrateWallet) {
      substrateWallet.unsubscribeSubstrateAccounts?.();
    }
  }

  connectWallet = (network: Domain, options?: { dappUrl?: string }): void => {
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
      evmWallet.provider.removeListener(
        'accountsChanged',
        this.onEvmAccountChange
      );
      evmWallet.provider.disconnect?.();
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

  connectEvmWallet = async (
    network: Domain,
    options?: { dappUrl?: string }
  ): Promise<void> => {
    const injected = injectedModule();

    const onboard = Onboard({
      wallets: [
        injected,
        walletConnectModule({
          projectId: '2f5a3439ef861e2a3959d85afcd32d06',
          dappUrl: options?.dappUrl
        })
      ],
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
      this.host.dispatchEvent(
        new WalletUpdateEvent({
          evmWallet: {
            address:
              wallets[0].accounts[0].ens?.name ??
              wallets[0].accounts[0].address,
            provider: wallets[0].provider
          }
        })
      );

      wallets[0].provider.on('accountsChanged', this.onEvmAccountChange);
      void onboard.setChain({
        //TODO: we need more info in network object in case we are adding new chain to metamask
        chainId: network.chainId
      });
    }
  };

  connectSubstrateWallet = async (
    _network: Domain, // TODO: remove underscore prefix once arg usage is added
    options?: { dappUrl?: string; dappName?: string }
  ): Promise<void> => {
    const injectedWalletProvider = new InjectedWalletProvider(
      { disallowed: [] },
      options?.dappName ?? 'Sygma Widget'
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

  private onEvmAccountChange = (accounts: string[]): void => {
    if (this.walletContext.value?.evmWallet && accounts.length !== 0) {
      this.host.dispatchEvent(
        new WalletUpdateEvent({
          evmWallet: {
            address: accounts[0],
            provider: this.walletContext.value.evmWallet.provider
          }
        })
      );
    }
    if (accounts.length === 0) {
      this.disconnectEvmWallet();
    }
  };

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
}
