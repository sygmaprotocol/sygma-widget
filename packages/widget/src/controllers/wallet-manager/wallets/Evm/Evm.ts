import events from 'events';
import type { Provider, Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import type { IEvmWallet } from '../../interfaces';
import { customEVMEvents } from '../../interfaces';
import type { AddChain } from '../../types';
import { checkWindow } from '../../utils';

class EvmWallet extends events.EventEmitter implements IEvmWallet {
  address?: string;
  signer?: ethers.Signer;
  web3Provider: Web3Provider;

  constructor(provider?: Web3Provider) {
    super();

    if (!window.ethereum) {
      throw new Error('window.ethereum is not defined.');
    }
    if (provider) {
      this.web3Provider = provider;
    } else {
      this.web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    }
    this.appendProviderEvents();
  }

  private async resetAccounts(accounts?: string[]): Promise<void> {
    if (accounts?.length) {
      this.address = accounts[0];
    }

    const _accounts = await this.web3Provider.listAccounts();

    if (!_accounts.length) {
      return;
    }

    this.address = _accounts[0];
    this.signer = this.web3Provider.getSigner();
  }

  private reconnectToProvider(): void {
    this.web3Provider = new ethers.providers.Web3Provider(window.ethereum);
  }

  private appendProviderEvents(): void {
    checkWindow();

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (this.web3Provider.provider as Provider).on('connect', async () => {
      this.reconnectToProvider();
      await this.resetAccounts();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (this.web3Provider.provider as Provider).on('disconnect', async () => {
      this.reconnectToProvider();
      await this.resetAccounts();
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    (this.web3Provider.provider as Provider).on('chainChanged', async () => {
      this.reconnectToProvider();
      await this.resetAccounts();

      this.emit(customEVMEvents.CHAIN_CHANGE, this.web3Provider);
    });

    (this.web3Provider.provider as Provider).on(
      'accountsChanged',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (accounts: string[]) => {
        this.reconnectToProvider();
        await this.resetAccounts(accounts);

        this.emit(customEVMEvents.ACCOUNT_CHANGE, this.address);
      }
    );
  }

  public async connect(): Promise<void> {
    checkWindow();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const accounts = await this.web3Provider.provider.request!({
      method: 'eth_requestAccounts'
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.address = accounts[0];
    this.signer = this.web3Provider.getSigner();
  }

  public async addChain({
    chainId,
    chainName,
    rpcUrl,
    nativeCurrency
  }: AddChain): Promise<void> {
    checkWindow();

    try {
      await this.web3Provider.provider.request!({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });
    } catch (switchError: unknown) {
      if ((switchError as { code: number }).code === 4902) {
        try {
          await this.web3Provider.provider.request!({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                rpcUrls: [rpcUrl],
                chainName,
                nativeCurrency
              }
            ]
          });
        } catch (addError: unknown) {
          if ((addError as { code: number }).code !== 4001) {
            throw addError;
          }
        }
      }
    }
  }
}

export { EvmWallet };
