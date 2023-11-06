import { ExternalProvider } from '@ethersproject/providers';

declare global {
  interface Window {
    ethereum: ExternalProvider;
  }
}

export type AddChain = {
  chainId: number;
  rpcUrl: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
};

export type SyntheticEventCreator = (
  eventName: string,
  dataToPass: Record<string, unknown> | number | string | Array<unknown>
) => void;

export enum Networks {
  EVM = 'EVM',
  Substrate = 'Substrate'
}
