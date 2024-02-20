import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { consume } from '@lit/context';
import type { HTMLTemplateResult, PropertyValues, TemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import type { Account } from '@polkadot-onboard/core';

import type { WalletContext } from '../../../context';
import { walletContext } from '../../../context';
import { WalletController } from '../../../controllers';
import { shortAddress } from '../../../utils';
import { BaseComponent } from '../base-component';

import { greenCircleIcon, identicon, plusIcon } from '../../../assets';
import type { DropdownOption } from '../dropdown/dropdown';
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

  private renderDisconnectSubstrateButton(): HTMLTemplateResult | undefined {
    return html` <div
      class="dropdownOption substrateDisconnectButton"
      part="substrateDisconnectButton"
      @click=${this.onDisconnectClicked}
    >
      Disconnect
    </div>`;
  }

  private renderSubstrateAccount(): HTMLTemplateResult {
    const substrateWallet = this.wallets.substrateWallet;
    if (!substrateWallet) return html``;

    function renderCustomOptionContent({
      name,
      address
    }: Account): HTMLTemplateResult {
      return html`
        <div part="customOptionContent">
          <div part="customOptionContentHeader">
            <span part="customOptionContentName">${name}</span>
          </div>
          <div part="customOptionContentMain">
            ${identicon}
            <div part="customOptionContentAccountData">
              <span part="customOptionContentAddress">${address}</span>
            </div>
          </div>
        </div>
      `;
    }

    function normalizeOptionsData(): DropdownOption<Account>[] {
      return substrateWallet!.accounts.map((account: Account) => ({
        id: account.address,
        name: shortAddress(account?.address ?? ''),
        value: account,
        icon: greenCircleIcon,
        customOptionHtml: renderCustomOptionContent(account)
      }));
    }

    const substrateAccount = substrateWallet?.accounts[0];
    const options = normalizeOptionsData();

    return when(
      !!substrateAccount,
      () =>
        html`<dropdown-component
          .actionOption=${this.renderDisconnectSubstrateButton()}
          .options=${options}
          .selectedOption=${options[0]}
        >
        </dropdown-component>`
    );
  }

  private renderConnectWalletButton(): HTMLTemplateResult | undefined {
    if (this.isWalletConnected() && this.wallets.substrateWallet)
      return undefined;

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
        html`<span class="walletAddress" title=${evmWallet?.address ?? ''}
          >${greenCircleIcon} ${shortAddress(evmWallet?.address ?? '')}</span
        >`
    );
  }

  render(): HTMLTemplateResult {
    return html` <div class="connectWalletContainer">
      ${this.renderWalletAddress()} ${this.renderSubstrateAccount()}
      ${this.renderConnectWalletButton()}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-connect-wallet-btn': ConnectWalletButton;
  }
}
