import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import type { EIP1193Provider } from '@web3-onboard/core';
import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

export class WalletController implements ReactiveController {
  host: ReactiveControllerHost;

  public evmWallet?: {
    provider: EIP1193Provider;
    address: string;
  };

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected(): void {}

  hostDisconnected(): void {
    if (this.evmWallet) {
      this.evmWallet.provider.removeListener(
        'accountsChanged',
        this.onEvmAccountChange
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

  connectEvmWallet = async (network: Domain): Promise<void> => {
    const injected = injectedModule();

    const onboard = Onboard({
      wallets: [injected],
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
      console.log('ens', wallets[0].accounts[0].ens);
      this.evmWallet = {
        address:
          wallets[0].accounts[0].ens?.name ?? wallets[0].accounts[0].address,
        provider: wallets[0].provider
      };
      this.host.requestUpdate();
      this.evmWallet.provider.on('accountsChanged', this.onEvmAccountChange);
      void onboard.setChain({
        //TODO: we need more info in network object in case we are adding new chain to metamask
        chainId: network.chainId
      });
    }
  };

  private onEvmAccountChange = (accounts: string[]): void => {
    if (this.evmWallet) {
      this.evmWallet.address = accounts[0];
      this.host.requestUpdate();
    }
  };
}
