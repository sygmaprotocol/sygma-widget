import type {
  EvmResource,
  Network,
  SubstrateResource
} from '@buildwithsygma/sygma-sdk-core';
import type { ethers } from 'ethers';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';

export type ThemeVariables =
  | 'mainColor'
  | 'secondaryColor'
  | 'fontSize'
  | 'borderRadius'
  | 'borderRadiusSecondary';

export type Theme = Record<ThemeVariables, string>;

export interface ISygmaProtocolWidget {
  whitelistedSourceNetworks?: Network[];
  whitelistedDestinationNetworks?: Network[];
  evmProvider?: ethers.providers.Web3Provider;
  substrateProvider?: ApiPromise | string;
  substrateSigner?: Signer;
  show?: boolean;
  whitelistedSourceResources?: Array<EvmResource | SubstrateResource>;
  expandable?: boolean;
  darkTheme?: boolean;
  customLogo?: SVGElement;
  theme?: Theme;
}
