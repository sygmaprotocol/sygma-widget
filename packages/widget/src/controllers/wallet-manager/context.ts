import { createContext } from '@lit/context';
import type { EIP1193Provider } from '@web3-onboard/core';

export interface EvmWallet {
  provider: EIP1193Provider;
  address: string;
}

export const evmWalletContext = createContext<EvmWallet>('sygmaEvmWallet');
