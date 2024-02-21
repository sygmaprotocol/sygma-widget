import { consume } from '@lit/context';
import type { Account } from '@polkadot-onboard/core';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { greenCircleIcon, identicon } from '../../assets';
import { type WalletContext, walletContext } from '../../context';
import { WalletController } from '../../controllers';
import { shortAddress } from '../../utils';
import { BaseComponent } from '../common/base-component';
import type { DropdownOption } from '../common/dropdown/dropdown';

import { substrateAccountSelectorStyles } from './styles';

@customElement('sygma-substrate-account-selector')
export class SubstrateAccountSelector extends BaseComponent {
  static styles = substrateAccountSelectorStyles;

  @consume({ context: walletContext, subscribe: true })
  @state()
  private wallets!: WalletContext;

  private walletController = new WalletController(this);

  private onDisconnectClicked = (): void => {
    this.walletController.disconnectWallet();
  };

  private handleSubstrateAccountSelected = (
    option: DropdownOption<Account>
  ): void => this.walletController.onSubstrateAccountSelected(option.value);

  private renderDisconnectSubstrateButton(): HTMLTemplateResult | undefined {
    return html` <div
      class="dropdownOption substrateDisconnectButton"
      part="substrateDisconnectButton"
      @click=${this.onDisconnectClicked}
    >
      Disconnect
    </div>`;
  }

  private normalizeOptionsData(): DropdownOption<Account>[] {
    const substrateWallet = this.wallets.substrateWallet;
    if (!substrateWallet) return [];

    return substrateWallet.accounts.map((account: Account) => ({
      id: account.address,
      name: shortAddress(account?.address ?? ''),
      value: account,
      icon: greenCircleIcon,
      customOptionHtml: this.renderCustomOptionContent(account)
    }));
  }

  private renderCustomOptionContent({
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

  render(): HTMLTemplateResult {
    const substrateWallet = this.wallets.substrateWallet;
    const substrateAccount = substrateWallet?.accounts[0];
    const options = this.normalizeOptionsData();

    return when(
      !!substrateAccount,
      () =>
        html`<dropdown-component
          .actionOption=${this.renderDisconnectSubstrateButton()}
          .options=${options}
          .selectedOption=${options[0]}
          .onOptionSelected=${this.handleSubstrateAccountSelected}
        >
        </dropdown-component>`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-substrate-account-selector': SubstrateAccountSelector;
  }
}
