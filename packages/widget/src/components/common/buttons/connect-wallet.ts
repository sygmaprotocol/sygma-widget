import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { consume } from '@lit/context';
import type { HTMLTemplateResult, PropertyValues, TemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';

import { greenCircleIcon, plusIcon } from '../../../assets';
import type { WalletContext } from '../../../context';
import { walletContext } from '../../../context';
import { WalletController } from '../../../controllers';
import { shortAddress } from '../../../utils';
import { BaseComponent } from '../base-component';

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

  @property({ type: String })
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

  private renderConnectWalletButton(): HTMLTemplateResult | undefined {
    if (this.wallets.substrateWallet) return;

    return when(
      this.isWalletConnected(),
      () =>
        html` <button
          role="button"
          @click=${this.onDisconnectClicked}
          class="connectWalletButton"
        >
          Disconnect
        </button>`,
      () =>
        html` <button
          @click=${this.onConnectClicked}
          role="button"
          class="connectWalletButton"
        >
          ${plusIcon} Connect Wallet
        </button>`
    );
  }

  private renderWalletAddress(): TemplateResult {
    const evmWallet = this.wallets.evmWallet;

    return when(
      !!evmWallet?.address,
      () =>
        html`<span class="walletAddress" title=${ifDefined(evmWallet?.address)}>
          ${greenCircleIcon} ${shortAddress(evmWallet?.address ?? '')}
        </span>`,
      () => html`
        <sygma-substrate-account-selector></sygma-substrate-account-selector>
      `
    );
  }

  render(): HTMLTemplateResult {
    return html` <div class="connectWalletContainer">
      ${this.renderWalletAddress()} ${this.renderConnectWalletButton()}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-connect-wallet-btn': ConnectWalletButton;
  }
}
