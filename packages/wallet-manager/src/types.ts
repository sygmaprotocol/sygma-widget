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
