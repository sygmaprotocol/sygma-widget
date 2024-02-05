import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { consume } from '@lit/context';
import type { HTMLTemplateResult, PropertyValues } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import plusIcon from '../../assets/icons/plusIcon';
import type { WalletContext } from '../../context';
import { walletContext } from '../../context';
import { WalletController } from '../../controllers';
import { shortAddress } from '../../utils';
import { BaseComponent } from '../base-component/base-component';
import greenCircleIcon from '../../assets/icons/greenCircleIcon';
import { styles } from './connect-wallet.style';

@customElement('sygma-connect-wallet-btn')
export class ConnectWalletButton extends BaseComponent {
  static styles = styles;

  @property({
    type: Object,
    attribute: true,
    hasChanged: (value: Domain, old: Domain) => {
      return value?.id !== old?.id;
    }
  })
  sourceNetwork?: Domain;

  @property({
    type: String
  })
  dappUrl?: string;

  @consume({ context: walletContext, subscribe: true })
  @state()
  private wallets!: WalletContext;

  private walletController = new WalletController(this);

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('sourceNetwork')) {
      this.walletController.sourceNetworkUpdated(this.sourceNetwork);
    }
  }

  private onConnectClicked = (): void => {
    if (this.sourceNetwork) {
      this.walletController.connectWallet(this.sourceNetwork, {
        dappUrl: this.dappUrl
      });
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
