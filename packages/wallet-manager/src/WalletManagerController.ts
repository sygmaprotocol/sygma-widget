import { ReactiveControllerHost } from 'lit';
import { EvmWallet, SubstrateWallet } from '.';
import { Web3Provider } from '@ethersproject/providers';
import { ApiPromise } from '@polkadot/api';
import { AddChain } from './types';
import { IWalletManagerController } from './interfaces';
import { Signer } from '@ethersproject/abstract-signer';

const EVM_EVENTS = {
  WalletAccountChanged: 'walletAccountChanged',
  WalletChainChanged: 'walletChainChanged'
} as const;

export class WalletManagerController implements IWalletManagerController {
  private host: ReactiveControllerHost;
  evmWallet?: EvmWallet;
  substrateWallet?: SubstrateWallet;
  account?: string;
  substrateAccount?: string;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostDisconnected(): void {
    if (this.evmWallet) {
      this.evmWallet?.removeListener('walletAccountChanged', () => {});
      this.evmWallet?.removeListener('walletChainChanged', () => {});
    }
  }

  public addWalletAccountChangeEventListener(
    callback: (account: string) => void
  ): void {
    this.evmWallet?.addListener(EVM_EVENTS.WalletAccountChanged, (account) => {
      this.account = account;
      callback(account);
    });
  }

  public addWalletChainChangedEventListener(callback: () => void): void {
    this.evmWallet?.addListener(EVM_EVENTS.WalletChainChanged, () => {
      this.account = this.evmWallet?.address;
      callback();
    });
  }

  /**
   *
   * @name initWeb3Provider
   * @description Initializes the EvmWallet from a Web3Provider
   */
  public initWeb3Provider(web3Provider?: Web3Provider): void {
    if (web3Provider) {
      this.evmWallet = new EvmWallet(web3Provider);
    } else {
      this.evmWallet = new EvmWallet();
    }
  }

  /**
   * @name connectFromApiPromise
   * @description Initializes the SubstrateWallet from an ApiPromise
   */
  public connectFromApiPromise(apiPromise: ApiPromise): void {
    this.substrateWallet = SubstrateWallet.connectFromApiPromise(apiPromise);
  }

  /**
   * @name connectFromWssProvider
   * @description Initializes the SubstrateWallet from a wssProvider
   */
  public async connectFromWssProvider(wssProvider: string): Promise<void> {
    this.substrateWallet =
      await SubstrateWallet.connectFromWssProvider(wssProvider);
  }

  /**
   * @name addChain
   * @description Adds a chain to the EvmWallet
   */
  public async addChain({
    chainId,
    chainName,
    rpcUrl,
    nativeCurrency
  }: AddChain): Promise<void> {
    try {
      await this.evmWallet?.addChain({
        chainId,
        chainName,
        rpcUrl,
        nativeCurrency
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @name connect
   * @description Connects the Substrate extension key manager
   */
  public async connectToSubstrate(): Promise<void> {
    await this.substrateWallet?.connect();
    this.substrateAccount = this.substrateWallet?.substrateAccount;
    this.host.requestUpdate();
  }

  /**
   * @name connectEvmWallet
   * @description Connects the EvmWallet
   */
  public async connectEvmWallet(): Promise<void> {
    try {
      await this.evmWallet?.connect();
      this.account = this.evmWallet?.address;
      this.host.requestUpdate();
    } catch (e) {
      throw e;
    }
  }

  public getSigner(): Signer {
    if (this.evmWallet?.signer) {
      return this.evmWallet.signer;
    } else {
      throw new Error('EvmWallet not initialized');
    }
  }

  get accountData(): string | undefined {
    return this.account;
  }

  get substrateAccountAddress(): string | undefined {
    return this.substrateAccount;
  }

  get provider(): Web3Provider | undefined {
    return this.evmWallet?.web3Provider;
  }

  get apiPromise(): ApiPromise | undefined {
    if (this.substrateWallet) {
      return this.substrateWallet?.apiPromise;
    } else {
      throw new Error('SubstrateWallet not initialized');
    }
  }
}
