import { Constructor } from '@lit/reactive-element/decorators/base.js';
import {
  WalletManagerContext,
  WalletManagerController
} from '@buildwithsygma/sygmaprotocol-wallet-manager';
import {
  SdkManager,
  SdkManagerContext
} from '@buildwithsygma/sygmaprotocol-sdk-manager';
import { LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { IWidgetMixin } from '../../interfaces';
import {
  EthereumConfig,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';

const WidgetMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class Mixin extends superClass {
    @consume({ context: WalletManagerContext, subscribe: true })
    @state()
    walletManager?: WalletManagerController;

    @consume({ context: SdkManagerContext, subscribe: true })
    @state()
    sdkManager?: SdkManager;

    @state()
    chainId?: number;

    @state({
      hasChanged: (n, o) => n !== o
    })
    domains?: EthereumConfig[] | SubstrateConfig[];

    @state({
      hasChanged: (n, o) => n !== o
    })
    homechain?: EthereumConfig | SubstrateConfig;

    @state({
      hasChanged: (n, o) => n !== o
    })
    selectedNetworkChainId?: number;

    @state({
      hasChanged: (n, o) => n !== o
    })
    destinationDomains?: EthereumConfig[] | SubstrateConfig[];

    @state({
      hasChanged: (n, o) => n !== o
    })
    resources?: Resource[];

    @state({
      hasChanged: (n, o) => n !== o
    })
    selectedAmount?: number;

    @state({
      hasChanged: (n, o) => n !== o
    })
    selectedToken?: Pick<Resource, 'resourceId'>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...rest: any[]) {
      super(rest);
    }
  }

  return Mixin as Constructor<IWidgetMixin> & T;
};

export default WidgetMixin;
