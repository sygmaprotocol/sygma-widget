import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import type { ContextProvider } from '@lit/context';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { evmWalletContext } from './context';

export class WalletController implements ReactiveController {
  host: ReactiveControllerHost;

  private evmWallet: ContextProvider<typeof evmWalletContext>;

  constructor(
    host: ReactiveControllerHost,
    evmWallet: ContextProvider<typeof evmWalletContext>
  ) {
    (this.host = host).addController(this);
    this.evmWallet = evmWallet;
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    if (this.evmWallet) {
      this.evmWallet.value.provider.removeListener(
        'accountsChanged',
        this.onEvmAccountChange
      );
      this.evmWallet.value.provider.removeListener(
        'disconnect',
        this.onEvmDisconnect
      );
    }
  }

  connectWallet = (network: Domain): void => {
    switch (network.type) {
      case Network.EVM:
        {
          void this.connectEvmWallet(network);
        }
        break;
      default:
        throw new Error('Unsupported newtork type');
    }
  };

  disconnectWallet = (): void => {
    if (this.evmWallet) {
      this.evmWallet.value.provider.disconnect?.();
      this.onEvmDisconnect();
    }
  };

  connectEvmWallet = async (network: Domain): Promise<void> => {
    const injected = injectedModule();

    const onboard = Onboard({
      wallets: [
        injected,
        walletConnectModule({ projectId: '2f5a3439ef861e2a3959d85afcd32d06' })
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
      this.evmWallet.setValue({
        address:
          wallets[0].accounts[0].ens?.name ?? wallets[0].accounts[0].address,
        provider: wallets[0].provider
      });
      this.evmWallet.value.provider.on(
        'accountsChanged',
        this.onEvmAccountChange
      );
      this.evmWallet.value.provider.on('disconnect', this.onEvmDisconnect);
      void onboard.setChain({
        //TODO: we need more info in network object in case we are adding new chain to metamask
        chainId: network.chainId
      });
    }
  };

  private onEvmAccountChange = (accounts: string[]): void => {
    if (this.evmWallet && accounts.length !== 0) {
      this.evmWallet.setValue({
        address: accounts[0],
        provider: this.evmWallet.value.provider
      });
    }
    if (accounts.length === 0) {
      this.onEvmDisconnect();
    }
  };

  private onEvmDisconnect = (): void => {
    this.evmWallet.setValue(undefined);
    this.host.requestUpdate();
  };
}
