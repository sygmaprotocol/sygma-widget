import { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { ParachainID } from '@buildwithsygma/sygma-sdk-core/substrate';

export const DEFAULT_ETH_DECIMALS = 18;

export const MAINNET_EXPLORER_URL = 'https://scan.buildwithsygma.com/transfer/';
export const TESTNET_EXPLORER_URL =
  'https://scan.test.buildwithsygma.com/transfer/';

export const SUBSTRATE_RPCS: {
  [env in Environment]: Record<ParachainID, string>;
} = {
  [Environment.DEVNET]: {},
  [Environment.LOCAL]: {},
  [Environment.TESTNET]: {
    2004: 'wss://rhala-node.phala.network/ws'
  },
  [Environment.MAINNET]: {
    2004: 'wss://rpc.helikon.io/khala',
    2035: 'wss://phala.api.onfinality.io/public-ws'
  }
};
