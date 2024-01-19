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

    (this.web3Provider.provider as Provider).on('connect', () => {
      this.reconnectToProvider();

      void this.resetAccounts();
    });

    (this.web3Provider.provider as Provider).on('disconnect', () => {
      this.reconnectToProvider();

      void this.resetAccounts();
    });

    (this.web3Provider.provider as Provider).on('chainChanged', () => {
      this.reconnectToProvider();

      void this.resetAccounts().then(() => {
        this.emit(customEVMEvents.CHAIN_CHANGE, this.web3Provider);
      });
    });

    (this.web3Provider.provider as Provider).on(
      'accountsChanged',
      (accounts: string[]) => {
        this.reconnectToProvider();
        void this.resetAccounts(accounts).then(() => {
          this.emit(customEVMEvents.ACCOUNT_CHANGE, this.address);
        });
      }
    );
  }

  public async connect(): Promise<void> {
    checkWindow();

    const accounts = (await this.web3Provider.provider.request!({
      method: 'eth_requestAccounts'
    })) as Array<string>;

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
