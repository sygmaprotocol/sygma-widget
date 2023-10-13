import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ISusbtrateWallet } from '../../interfaces';

class SubstrateWallet implements ISusbtrateWallet {
  substrateAccount?: string;
  apiPromise?: ApiPromise;
  wssProvider?: WsProvider;

  constructor(apiPromise?: ApiPromise) {
    this.apiPromise = apiPromise;
  }

  /**
   * @name connectFromWssProvider
   * @param wssProvider
   * @returns {Promise<SubstrateWallet>}
   * @description Initializes the SubstrateWallet from a wssProvider
   */
  static async connectFromWssProvider(
    wssProvider: string
  ): Promise<SubstrateWallet> {
    const wsProvider = await SubstrateWallet.conntectToApi(wssProvider);
    const apiPromise = await ApiPromise.create({ provider: wsProvider });
    return new SubstrateWallet(apiPromise);
  }

  /**
   * @name connectFromApiPromise
   * @param apiPromise
   * @returns {SubstrateWallet}
   * @description Initializes the SubstrateWallet from an ApiPromise
   */
  static connectFromApiPromise(apiPromise: ApiPromise): SubstrateWallet {
    return new SubstrateWallet(apiPromise);
  }

  /**
   * @name conntectToApi
   * @param wssProvider
   * @returns {WsProvider}
   * @description Initializes the WsProvider
   */
  static async conntectToApi(wssProvider: string): Promise<WsProvider> {
    const wsProvider = new WsProvider(wssProvider);
    return wsProvider;
  }

  /**
   * @name connect
   * @returns {Promise<void>}
   * @description Connects to the Substrate Wallet
   */
  public async connect(): Promise<void> {
    const injectors = await web3Enable('Polkadot Wallet');
    // using polkadot-js extension
    const polkadotInjector = injectors.find(
      (injector) => injector.name === 'polkadot-js'
    );

    if (polkadotInjector) {
      // eslint-disable-next-line no-console
      console.log('polkadot-js extension found');
      const allAccounts = await web3Accounts();
      this.substrateAccount = allAccounts[0].address;
    }
  }
}

export { SubstrateWallet };
