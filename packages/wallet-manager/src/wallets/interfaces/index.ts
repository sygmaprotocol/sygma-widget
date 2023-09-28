import { Provider, Web3Provider } from '@ethersproject/providers';
import { ApiPromise, WsProvider } from '@polkadot/api';

export interface SupportedWallet {
  id: string;
  name: string;
  icon: string;
  providerName: string;
}

export interface IEvmWallet {
  web3Provider: Web3Provider;
  windowConnector: Provider;
  account?: string;
  connect(): Promise<void>;
  addChain({
    chainId,
    rpcUrl,
    chainName
  }: {
    chainId: number;
    rpcUrl: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }): Promise<void>;
}

export interface SusbtrateWallet {
  wssProvider?: WsProvider;
  apiPromise?: ApiPromise;
  substrateAccount?: string;
}
