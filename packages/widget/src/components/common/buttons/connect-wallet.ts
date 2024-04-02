import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { consume } from '@lit/context';
import type { HTMLTemplateResult, PropertyValues } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { configContext, walletContext } from '../../../context';
import type { ConfigContext, WalletContext } from '../../../context';
import greenCircleIcon from '../../../assets/icons/greenCircleIcon';
import plusIcon from '../../../assets/icons/plusIcon';
import { WalletController } from '../../../controllers';
import { shortAddress } from '../../../utils';
import { BaseComponent } from '../base-component/base-component';

import { connectWalletStyles } from './connect-wallet.styles';

@customElement('sygma-connect-wallet-btn')
export class ConnectWalletButton extends BaseComponent {
  static styles = connectWalletStyles;

  @property({
    type: Object,
    attribute: true,
    hasChanged: (value: Domain, old: Domain) => {
      return value?.id !== old?.id;
    }
  })
  sourceNetwork?: Domain;

  @consume({ context: walletContext, subscribe: true })
  @state()
  private wallets!: WalletContext;

  @consume({ context: configContext, subscribe: true })
  @state()
  private configContext!: ConfigContext;

  private walletController = new WalletController(this);

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('sourceNetwork')) {
      this.walletController.sourceNetworkUpdated(this.sourceNetwork);
    }
  }

  private onConnectClicked = (): void => {
    if (this.sourceNetwork) {
      this.walletController.connectWallet(
        this.sourceNetwork,
        this.configContext
      );
    }
  };

  private onDisconnectClicked = (): void => {
    this.walletController.disconnectWallet();
  };

  private isWalletConnected(): boolean {
    return !!this.wallets.evmWallet || !!this.wallets.substrateWallet;
  }

  render(): HTMLTemplateResult {
    const evmWallet = this.wallets.evmWallet;
    const substrateWallet = this.wallets.substrateWallet;
    //TODO: this is wrong we need to enable user to select account
    const substrateAccount = substrateWallet?.accounts[0];
    return html` <div class="connectWalletContainer">
      ${when(
        !!evmWallet?.address,
        () =>
          html`<span class="walletAddress" title=${evmWallet?.address ?? ''}
            >${greenCircleIcon} ${shortAddress(evmWallet?.address ?? '')}</span
          >`
      )}
      ${when(
        !!substrateAccount,
        () =>
          html`<span
            class="walletAddress"
            title=${substrateAccount?.address ?? ''}
            >${greenCircleIcon} ${substrateAccount?.name}
            ${shortAddress(substrateAccount?.address ?? '')}</span
          >`
      )}
      ${when(
        this.isWalletConnected(),
        () =>
          html`<button
            @click=${this.onDisconnectClicked}
            class="connectWalletButton"
          >
            Disconnect
          </button>`,
        () =>
          html`<button
            @click=${this.onConnectClicked}
            class="connectWalletButton"
          >
            ${plusIcon} Connect Wallet
          </button>`
      )}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-connect-wallet-btn': ConnectWalletButton;
  }
}
