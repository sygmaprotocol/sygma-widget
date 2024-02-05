import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
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
      evmWallet.provider.removeListener('disconnect', this.onEvmDisconnect);
    }
  }

  connectWallet = (network: Domain, options?: { dappUrl?: string }): void => {
    switch (network.type) {
      case Network.EVM:
        {
          void this.connectEvmWallet(network, options);
        }
        break;
      default:
        throw new Error('Unsupported newtork type');
    }
  };

  disconnectEvmWallet = (): void => {
    const evmWallet = this.walletContext.value?.evmWallet;
    if (evmWallet) {
      evmWallet?.provider.disconnect?.();
      this.onEvmDisconnect();
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
      wallets[0].provider.on('disconnect', this.onEvmDisconnect);
      void onboard.setChain({
        //TODO: we need more info in network object in case we are adding new chain to metamask
        chainId: network.chainId
      });
    }
  };

  sourceNetworkUpdated(sourceNetwork: Domain | undefined): void {
    if (!sourceNetwork) {
      this.disconnectEvmWallet();
    }
    switch (sourceNetwork?.type) {
      case Network.SUBSTRATE:
        {
          this.disconnectEvmWallet();
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
      this.onEvmDisconnect();
    }
  };

  private onEvmDisconnect = (): void => {
    this.host.dispatchEvent(
      new WalletUpdateEvent({
        evmWallet: undefined
      })
    );
  };
}
