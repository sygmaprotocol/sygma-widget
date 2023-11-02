import { ReactiveControllerHost } from 'lit';
import { EvmWallet, SubstrateWallet } from '.';
import { Web3Provider } from '@ethersproject/providers';
import { ApiPromise } from '@polkadot/api';
import { AddChain } from './types';
import { customEVMEvents, IWalletManagerController } from './interfaces';
import { Signer } from '@ethersproject/abstract-signer';

export class WalletManagerController implements IWalletManagerController {
  private host: ReactiveControllerHost;
  evmWallet?: EvmWallet;
  substrateWallet?: SubstrateWallet;
  account?: string;
  substrateAccount?: string;

  constructor(
    host: ReactiveControllerHost,
    initArguments?: {
      web3Provider?: Web3Provider;
      apiPromise?: ApiPromise;
      wssConnectionUrl?: string;
    }
  ) {
    (this.host = host).addController(this);

    if (initArguments?.web3Provider) {
      this.initWeb3Provider(initArguments.web3Provider);
    } else if (initArguments?.apiPromise) {
      this.connectFromApiPromise(initArguments.apiPromise);
    } else if (initArguments?.wssConnectionUrl) {
      this.connectFromWssProvider(initArguments.wssConnectionUrl);
    } else {
      this.initWeb3Provider();
    }
  }

  hostDisconnected(): void {
    if (this.evmWallet) {
      this.evmWallet?.removeListener(customEVMEvents.ACCOUNT_CHANGE, () => {});
      this.evmWallet?.removeListener(customEVMEvents.CHAIN_CHANGE, () => {});
    }
  }

  public addAccountChangedEventListener(
    callback: (account: string) => void
  ): void {
    this.evmWallet?.addListener(customEVMEvents.ACCOUNT_CHANGE, (account) => {
      this.account = account;
      callback(account);
    });
  }

  public addChainChangedEventListener(callback: () => void): void {
    this.evmWallet?.addListener(customEVMEvents.CHAIN_CHANGE, () => {
      this.account = this.evmWallet?.address;
      callback();
    });
  }

  public initWeb3Provider(web3Provider?: Web3Provider): void {
    this.evmWallet = new EvmWallet(web3Provider);
  }

  public connectFromApiPromise(apiPromise: ApiPromise): void {
    this.substrateWallet = SubstrateWallet.connectFromApiPromise(apiPromise);
  }

  public async connectFromWssProvider(wssProvider: string): Promise<void> {
    this.substrateWallet =
      await SubstrateWallet.connectFromWssProvider(wssProvider);
  }

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

  public async connectToSubstrate(): Promise<void> {
    await this.substrateWallet?.connect();
    this.substrateAccount = this.substrateWallet?.substrateAccount;
    this.host.requestUpdate();
  }

  public async connectEvmWallet(): Promise<void> {
    await this.evmWallet?.connect();
    this.account = this.evmWallet?.address;
    this.host.requestUpdate();
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
      return this.substrateWallet.apiPromise;
    } else {
      throw new Error('SubstrateWallet not initialized');
    }
  }
}
