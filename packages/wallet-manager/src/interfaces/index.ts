import { Web3Provider } from '@ethersproject/providers';
import { ApiPromise } from '@polkadot/api';
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
  }: Pick<AddChain, 'chainId' | 'rpcUrl' | 'chainName'>): Promise<void>;
}

export interface ISubstrateWallet {
  apiPromise: ApiPromise;
  substrateAccount?: string;
}

export interface IWalletManagerController extends ReactiveController {
  evmWallet?: IEvmWallet;
  substrateWallet?: ISubstrateWallet;
  account?: string;
  substrateAccount?: string;

  initWeb3Provider(web3Provider?: Web3Provider): void;
  initFromWssProvider(wssProvider: string): Promise<void>;
  initFromApiPromise(apiPromise: ApiPromise): void;
  addChain(addChainParameters: AddChain): Promise<void>;
  connectToSubstrate(): Promise<void>;
  connectEvmWallet(): Promise<void>;
}

export const customEVMEvents = {
  ACCOUNT_CHANGE: 'account-change',
  CHAIN_CHANGE: 'chain-change'
} as const;
