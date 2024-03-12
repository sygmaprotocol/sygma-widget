import type { Resource } from '@buildwithsygma/sygma-sdk-core';
import type { BigNumber } from 'ethers';
import { utils } from 'ethers';
import type { HTMLTemplateResult, PropertyDeclaration } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import type { PropertyValues } from '@lit/reactive-element';
import { networkIconsMap } from '../../assets';
import { DEFAULT_ETH_DECIMALS } from '../../constants';
import {
  BALANCE_UPDATE_KEY,
  TokenBalanceController
} from '../../controllers/wallet-manager/token-balance';
import { tokenBalanceToNumber } from '../../utils/token';
import { BaseComponent } from '../common';
import type { DropdownOption } from '../common/dropdown/dropdown';
import { styles } from './styles';

@customElement('sygma-resource-selector')
export class AmountSelector extends BaseComponent {
  static styles = styles;

  @property({
    type: Array
  })
  resources: Resource[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  preselectedToken?: string;

  @property({ attribute: false })
  /**
   * amount is in lowest denomination (it's up to parent component to get resource decimals)
   */
  onResourceSelected: (resource: Resource, amount: BigNumber) => void =
    () => {};

  @state() selectedResource: Resource | null = null;
  @state() validationMessage: string | null = null;
  @state() amount: number = 0;

  tokenBalanceController = new TokenBalanceController(this);

  _useMaxBalance = (): void => {
    this.amount = tokenBalanceToNumber(
      this.tokenBalanceController.balance,
      this.tokenBalanceController.decimals
    );
  };

  _onInputAmountChangeHandler = (event: Event): void => {
    const { value } = event.target as HTMLInputElement;
    this.amount = Number.parseFloat(value);
    if (!this._validateAmount(value)) return;
    if (this.selectedResource) {
      this.onResourceSelected(
        this.selectedResource,
        utils.parseUnits(
          this.amount.toString(),
          this.selectedResource.decimals ?? DEFAULT_ETH_DECIMALS
        )
      );
    }
  };

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<unknown, unknown>
  ): void {
    super.requestUpdate(name, oldValue, options);
    if (name === BALANCE_UPDATE_KEY) {
      this._validateAmount(String(this.amount));
    }
  }

  _onResourceSelectedHandler = (option?: DropdownOption<Resource>): void => {
    if (option) {
      this.selectedResource = option.value;
      this.amount = 0;
      this.tokenBalanceController.startBalanceUpdates(this.selectedResource);
    } else {
      this.selectedResource = null;
      this.tokenBalanceController.resetBalance();
    }
  };

  _validateAmount(amount: string): boolean {
    const parsedAmount = Number.parseFloat(amount);
    if (isNaN(parsedAmount)) {
      this.validationMessage = 'Invalid amount value';
      return false;
    }
    if (parsedAmount < 0) {
      this.validationMessage = 'Amount must be greater than 0';
      return false;
    } else if (
      parsedAmount >
      tokenBalanceToNumber(
        this.tokenBalanceController.balance,
        this.tokenBalanceController.decimals
      )
    ) {
      this.validationMessage = 'Amount exceeds account balance';
      return false;
    } else {
      this.validationMessage = null;
      return true;
    }
  }

  _renderAccountBalance(): HTMLTemplateResult {
    return html`
      <section class="balanceContent">
        <span
          >${`${tokenBalanceToNumber(this.tokenBalanceController.balance, this.tokenBalanceController.decimals).toFixed(4)}`}</span
        >
        <button class="maxButton" @click=${this._useMaxBalance}>Max</button>
      </section>
    `;
  }

  _renderErrorMessages(): HTMLTemplateResult {
    return when(
      this.validationMessage,
      () => html`<div class="validationMessage">${this.validationMessage}</div>`
    );
  }

  _normalizeOptions(): DropdownOption<Resource>[] {
    return when(this.resources, () =>
      this.resources.map((entry) => ({
        id: entry.resourceId,
        name: entry.symbol!,
        icon: networkIconsMap.default,
        value: entry
      }))
    );
  }

  updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('selectedResource')) {
      this.tokenBalanceController.resetBalance();
    }
  }

  render(): HTMLTemplateResult {
    const amountSelectorContainerClasses = classMap({
      amountSelectorContainer: true,
      hasError: !!this.validationMessage
    });

    return html`
      <div class=${amountSelectorContainerClasses}>
        <section class="tokenBalanceSection">
          <label class="amountSelectorLabel">Amount to transfer</label>
          ${this._renderAccountBalance()}
        </section>
        <section class="amountSelectorSection">
          <div class="amountWrapper">
            <input
              type="number"
              class="amountSelectorInput"
              placeholder="0.000"
              @change=${this._onInputAmountChangeHandler}
              value=${this.amount === 0 ? '' : this.amount.toString()}
            />
            <section class="selectorSection">
              <dropdown-component
                ?disabled=${this.disabled}
                .onOptionSelected=${this._onResourceSelectedHandler}
                .options=${this._normalizeOptions()}
              ></dropdown-component>
            </section>
          </div>
          <div class="errorWrapper">${this._renderErrorMessages()}</div>
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-resource-selector': AmountSelector;
  }
}
