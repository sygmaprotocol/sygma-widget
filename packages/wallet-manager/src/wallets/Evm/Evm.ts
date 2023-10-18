import { ethers } from 'ethers';
import events from 'events';
import type {
  Web3Provider,
  ExternalProvider,
  Provider
} from '@ethersproject/providers';
import { IEvmWallet } from '../../interfaces';
import { AddChain } from '../../types';

class EvmWallet extends events.EventEmitter implements IEvmWallet {
  address?: string;
  signer?: ethers.Signer;
  web3Provider!: Web3Provider;

  constructor(provider?: Web3Provider) {
    super();

    if (!window.ethereum) {
      throw new Error('window.ethereum is not defined.');
    }
    if (!provider) {
      this.web3Provider = new ethers.providers.Web3Provider(
        window.ethereum as ExternalProvider
      );
    } else {
      this.web3Provider = provider;
    }
    this.appendProviderEvents();
  }

  /**
   * @name initFromWeb3Provider
   * @param web3Provider
   * @returns {EvmWallet}
   * @description Initializes the EvmWallet from a Web3Provider
   */
  static initFromWeb3Provider(web3Provider: Web3Provider): EvmWallet {
    return new EvmWallet(web3Provider);
  }

  /**
   * @name initFromWindow
   * @returns {EvmWallet}
   * @description Initializes the EvmWallet from a valid EIP-1193 provider
   */
  static initFromWindow(): EvmWallet {
    return new EvmWallet();
  }

  /**
   * @name calculateAccountData
   * @param accounts
   * @returns {Promise<void>}
   */
  private async calculateAccountData(accounts?: string[]): Promise<void> {
    if (accounts?.length) {
      this.address = accounts[0];
    }

    const _accounts = await this.web3Provider.listAccounts();

    if (!_accounts.length) {
      return;
    }

    this.address = _accounts![0];
    this.signer = this.web3Provider.getSigner();
  }

  /**
   * @name reConnectToProvider
   * @returns {void}
   */
  private reConnectToProvider(): void {
    this.web3Provider = new ethers.providers.Web3Provider(
      window.ethereum as ExternalProvider
    );
  }

  /**
   * @name appendProviderEvents
   * @returns {void}
   * @description Appends the provider events to the windowConnector
   */
  private appendProviderEvents(): void {
    try {
      this.checkWindow();
    } catch (e) {
      throw e;
    }
    (this.web3Provider.provider as Provider).on('connect', async () => {
      this.reConnectToProvider();
      await this.calculateAccountData();
    });

    (this.web3Provider.provider as Provider).on(
      'disconnect',
      async (error: Error & { code: number; data?: unknown }) => {
        // eslint-disable-next-line no-console
        console.error(error);
        this.reConnectToProvider();
        await this.calculateAccountData();
      }
    );

    (this.web3Provider.provider as Provider).on('chainChanged', async () => {
      this.reConnectToProvider();
      await this.calculateAccountData();

      this.emit('walletChainChanged', this.web3Provider);
    });

    (this.web3Provider.provider as Provider).on(
      'accountsChanged',
      async (accounts: string[]) => {
        this.reConnectToProvider();
        await this.calculateAccountData(accounts);

        this.emit('walletAccountChanged', this.address);
      }
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private checkWindow() {
    if (window === undefined) {
      throw new Error('window object is not defined.');
    }
  }

  /**
   * @name connect
   * @description Connects the wallet to the provider
   * @throws {Error} if the window object is not defined
   * @returns {Promise<void>}
   */
  public async connect() {
    try {
      this.checkWindow();
    } catch (e) {
      throw e;
    }

    try {
      const accounts = await (this.web3Provider.provider as ExternalProvider)
        .request!({
        method: 'eth_requestAccounts'
      });
      this.address = accounts[0];
      this.signer = this.web3Provider.getSigner();
    } catch (e) {
      throw e;
    }
  }

  /**
   * @name addChain
   * @param chainId
   * @param chainName
   * @param rpcUrl
   * @param nativeCurrency - { name, symbol, decimals }
   * @returns void
   * @description Adds a new chain to the wallet
   */
  public async addChain({
    chainId,
    chainName,
    rpcUrl,
    nativeCurrency
  }: AddChain): Promise<void> {
    this.checkWindow();

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
