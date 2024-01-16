import { WalletManagerController } from '@buildwithsygma/sygmaprotocol-wallet-manager';
import { SdkManager } from '@buildwithsygma/sygmaprotocol-sdk-manager';
import {
  EthereumConfig,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';

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
  selectedToken?: Pick<Resource, 'resourceId'>;
}
