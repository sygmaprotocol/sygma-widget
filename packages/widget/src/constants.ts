import { Environment } from '@buildwithsygma/sygma-sdk-core';

export const DEFAULT_ETH_DECIMALS = 18;

export const MAINNET_EXPLORER_URL = 'https://scan.buildwithsygma.com/transfer/';
export const TESTNET_EXPLORER_URL =
  'https://scan.test.buildwithsygma.com/transfer/';

export const SUBSTRATE_CHAIN_RPCS: { [env in Environment]: Array<string> } = {
  [Environment.DEVNET]: [],
  [Environment.LOCAL]: [],
  [Environment.TESTNET]: ['wss://rhala-node.phala.network/ws'],
  [Environment.MAINNET]: [
    'wss://rpc.helikon.io/khala',
    'wss://phala.api.onfinality.io/public-ws'
  ]
};
