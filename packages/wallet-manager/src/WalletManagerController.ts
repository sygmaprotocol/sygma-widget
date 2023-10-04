import { ReactiveController, ReactiveControllerHost } from 'lit';
import { EvmWallet, SubstrateWallet } from '.';
import { Web3Provider } from '@ethersproject/providers';
import { ApiPromise } from '@polkadot/api';
import { AddChain } from './types';
import { IWalletManagerController } from './wallets/interfaces';

export class WalletManagerController implements IWalletManagerController {
  host: ReactiveControllerHost;
  evmWallet?: EvmWallet;
  substrateWallet?: SubstrateWallet;
  account?: string;
  substrateAccount?: string;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this as ReactiveController);
  }

  /**
   * @name initFromWeb3Provider
   * @param web3Provider Web3Provider
   * @description Initializes the EvmWallet from a Web3Provider
   */
  public initFromWeb3Provider(web3Provider: Web3Provider): void {
    this.evmWallet = EvmWallet.initFromWeb3Provider(web3Provider);
    this.appendProviderEvents(this.evmWallet);
  }

  /**
   * @name initFromWindow
   * @description Initializes the EvmWallet from a valid EIP-1193 provider
   */
  public initFromWindow(): void {
    this.evmWallet = EvmWallet.initFromWindow();
  }

  /**
   * @name connectFromApiPromise
   * @param apiPromise
   * @description Initializes the SubstrateWallet from an ApiPromise
   */
  public connectFromApiPromise(apiPromise: ApiPromise): void {
    this.substrateWallet = SubstrateWallet.connectFromApiPromise(apiPromise);
  }

  /**
   * @name connectFromWssProvider
   * @param wssProvider
   * @description Initializes the SubstrateWallet from a wssProvider
   */
  public async connectFromWssProvider(wssProvider: string): Promise<void> {
    this.substrateWallet =
      await SubstrateWallet.connectFromWssProvider(wssProvider);
  }

  /**
   * @name addChain
   * @param { AddChain }
   * @description Adds a chain to the EvmWallet
   * @returns void
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
   * @returns void
   * @description Connects the Substrate extension key manager
   */
  public async connectoToSubstrate(): Promise<void> {
    await this.substrateWallet?.connect();
    this.substrateAccount = this.substrateWallet?.substrateAccount;
    this.host.requestUpdate();
  }

  /**
   * @name connectEvmWallet
   * @returns void
   * @description Connects the EvmWallet
   */
  public async connectEvmWallet(): Promise<void> {
    await this.evmWallet?.connect();
    this.account = this.evmWallet?.account;
    this.host.requestUpdate();
  }

  get accountData(): string | undefined {
    return this.account;
  }

  get substrateAccountAddress(): string | undefined {
    return this.substrateAccount;
  }

  private appendProviderEvents(evmWallet: EvmWallet): void {
    evmWallet.addListener('walletAccountChanged', (account) => {
      this.account = account;
      this.host.requestUpdate();
    });
  }
}
