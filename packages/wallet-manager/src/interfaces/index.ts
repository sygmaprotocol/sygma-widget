import { Web3Provider } from '@ethersproject/providers';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ReactiveController } from 'lit';
import { AddChain } from '../types';
import { Signer } from '@ethersproject/abstract-signer';

export interface SupportedWallet {
  id: string;
  name: string;
  icon: string;
  providerName: string;
}

export interface IEvmWallet {
  web3Provider: Web3Provider;
  address?: string;
  signer?: Signer;
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

export interface ISusbtrateWallet {
  wssProvider?: WsProvider;
  apiPromise?: ApiPromise;
  substrateAccount?: string;
}

export interface IWalletManagerController extends ReactiveController {
  web3Provider?: Web3Provider;
  apiPromise?: ApiPromise;
  wsProviderUrl?: string;
  evmWallet?: IEvmWallet;
  substrateWallet?: ISusbtrateWallet;
  account?: string;
  substrateAccount?: string;

  initFromWeb3Provider(web3Provider: Web3Provider): void;
  initFromWindow(): void;
  connectFromWssProvider(wssProvider: string): Promise<void>;
  connectFromApiPromise(apiPromise: ApiPromise): void;
  addChain(addChainParameters: AddChain): Promise<void>;
  connectoToSubstrate(): Promise<void>;
  connectEvmWallet(): Promise<void>;
}
