import type {
  EthereumConfig,
  Network,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import type { ethers } from 'ethers';
import type { ApiPromise } from '@polkadot/api';
import type { SdkManager, WalletManagerController } from '../controllers';

export interface IWidgetMixin {
  walletManager?: WalletManagerController;
  sdkManager?: SdkManager;
  chainId?: number;
  domains?: EthereumConfig[] | SubstrateConfig[];
  homechain?: EthereumConfig | SubstrateConfig;
  selectedNetworkChainId?: number;
  destinationDomains?: EthereumConfig[] | SubstrateConfig[];
  resources?: Resource[];
  selectedAmount?: number;
  selectedToken?: string;
  selectedTokenAddress?: string;
  tokenBalance?: string;
  tokenName?: string;
}

export interface ISygmaProtocolWidget {
  networks?: Network;
  web3Provider?: ethers.providers.Web3Provider;
  apiPromise?: ApiPromise;
  wssConnectionUrl?: string;
}
