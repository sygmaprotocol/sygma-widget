import type { Constructor } from '@lit/reactive-element/decorators/base.js';
import type { LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import type {
  EthereumConfig,
  Resource,
  SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import type { IWidgetMixin } from '../../interfaces';
import type { SdkManager, WalletManagerController } from '../../controllers';
import { SdkManagerContext, WalletManagerContext } from '../../controllers';

const WidgetMixin = <T extends Constructor<LitElement>>(
  superClass: T
): Constructor<IWidgetMixin> & T => {
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

    @state()
    selectedTokenAddress?: string;

    @state()
    tokenBalance?: string;

    @state()
    tokenName?: string;
  }

  return Mixin as Constructor<IWidgetMixin> & T;
};

export default WidgetMixin;
