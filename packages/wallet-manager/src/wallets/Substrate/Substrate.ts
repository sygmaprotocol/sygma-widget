import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { ISusbtrateWallet } from '../interfaces';

class SubstrateWallet implements ISusbtrateWallet {
  substrateAccount?: string;
  apiPromise?: ApiPromise;
  wssProvider?: WsProvider;

  constructor(apiPromise?: ApiPromise) {
    this.apiPromise = apiPromise;
  }

  static async connectFromWssProvider(wssProvider: string) {
    const wsProvider = await SubstrateWallet.conntectToApi(wssProvider);
    const apiPromise = await ApiPromise.create({ provider: wsProvider });
    return new SubstrateWallet(apiPromise);
  }

  static connectFromApiPromise(apiPromise: ApiPromise) {
    return new SubstrateWallet(apiPromise);
  }

  static async conntectToApi(wssProvider: string): Promise<WsProvider> {
    const wsProvider = new WsProvider(wssProvider);
    return wsProvider;
  }

  public async connect() {
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
