import type { Signer } from '@ethersproject/abstract-signer';
import type { Web3Provider } from '@ethersproject/providers';
import type { ApiPromise } from '@polkadot/api';
import type { ReactiveControllerHost } from 'lit';
import type { IWalletManagerController } from './interfaces';
import { customEVMEvents } from './interfaces';
import type { AddChain } from './types';
import { Network } from './types';
import { EvmWallet, SubstrateWallet } from '.';

export class WalletManagerController implements IWalletManagerController {
  private host: ReactiveControllerHost;
  evmWallet?: EvmWallet;
  substrateWallet?: SubstrateWallet;
  account?: string;
  substrateAccount?: string;

  constructor(
    host: ReactiveControllerHost,
    network: Network,
    initArgument: {
      web3Provider?: Web3Provider;
      apiPromise?: ApiPromise;
      wssConnectionUrl?: string;
    }
  ) {
    (this.host = host).addController(this);

    if (network === Network.EVM) {
      this.initWeb3Provider(initArgument.web3Provider);
    } else if (network === Network.SUBSTRATE) {
      this.initFromApiPromise(initArgument as ApiPromise);
      // eslint-disable-next-line no-dupe-else-if
    } else if (network === Network.SUBSTRATE && initArgument.wssConnectionUrl) {
      void this.initFromWssProvider(initArgument as string);
    }
  }

  hostDisconnected(): void {
    if (this.evmWallet) {
      this.evmWallet?.removeAllListeners();
    }
  }

  public addAccountChangedEventListener(
    callback: (account: string) => void
  ): void {
    this.evmWallet?.addListener(customEVMEvents.ACCOUNT_CHANGE, (account) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.account = account;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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

  public initFromApiPromise(apiPromise: ApiPromise): void {
    this.substrateWallet = SubstrateWallet.initFromApiPromise(apiPromise);
  }

  public async initFromWssProvider(wssProvider: string): Promise<void> {
    this.substrateWallet =
      await SubstrateWallet.initFromWssProvider(wssProvider);
  }

  public async addChain({
    chainId,
    chainName,
    rpcUrl,
    nativeCurrency
  }: AddChain): Promise<void> {
    await this.evmWallet?.addChain({
      chainId,
      chainName,
      rpcUrl,
      nativeCurrency
    });
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
