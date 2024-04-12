import type { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { ApiPromise } from '@polkadot/api';
import type { Signer } from '@polkadot/api/types';
import type { WalletConnectOptions } from '@web3-onboard/walletconnect/dist/types';

export type ThemeVariables =
  | 'mainColor'
  | 'secondaryColor'
  | 'fontSize'
  | 'borderRadius'
  | 'borderRadiusSecondary';

export type Theme = Record<ThemeVariables, string>;

export interface Eip1193Provider {
  request(request: {
    method: string;
    params?: Array<unknown> | Record<string, unknown>;
  }): Promise<unknown>;
}

export interface ISygmaProtocolWidget {
  environment?: Environment;
  whitelistedSourceNetworks?: string[];
  whitelistedDestinationNetworks?: string[];
  whitelistedSourceResources?: string[];
  evmProvider?: Eip1193Provider;
  substrateProvider?: ApiPromise | string;
  substrateSigner?: Signer;
  show?: boolean;
  expandable?: boolean;
  darkTheme?: boolean;
  customLogo?: SVGElement;
  theme?: Theme;
  walletConnectOptions?: WalletConnectOptions;
}
