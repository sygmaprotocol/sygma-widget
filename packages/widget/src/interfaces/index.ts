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
  networks?: Network;
  web3Provider?: ethers.providers.Web3Provider;
  apiPromise?: ApiPromise | string;
  signer: Signer;
  disabled?: boolean;
  whitelistedResource: EvmResource | SubstrateResource;
  expandable: boolean;
  darkTheme: boolean;
  customLogo: SVGElement;
  theme: Theme;
}
