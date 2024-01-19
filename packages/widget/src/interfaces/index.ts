import type {
  EthereumConfig,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
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
