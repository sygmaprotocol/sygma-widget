import type { Resource } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';

import { networkIconsMap } from '../../assets';
import { BaseComponent } from '../common/base-component/base-component';
import type { DropdownOption } from '../common/dropdown/dropdown';

import { styles } from './styles';

@customElement('sygma-resource-selector')
export class AmountSelector extends BaseComponent {
  static styles = styles;

  @property({ type: Array, hasChanged: (n, o) => n !== o })
  resources: Resource[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  accountBalance?: string;

  @property({ type: Object })
  preselectedToken?: DropdownOption<Resource> | null = null;

  @property({ type: Number })
  preselectedAmount?: number;

  @property({ attribute: false })
  onResourceSelected: (resource: Resource, amount: number) => void = () => {};

  @state() validationMessage: string | null = null;
  @state() selectedResource: Resource | null = null;
  @state() amount: string | null = null;

  _useMaxBalance = (): void => {
    if (Number.parseFloat(this.accountBalance!) === 0) {
      this.validationMessage = 'Insufficient balance';
      return;
    }

    this.amount = this.accountBalance!;
  };

  _onInputAmountChangeHandler = (event: Event): void => {
    const { value } = event.target as HTMLInputElement;
    if (!this._validateAmount(value)) return;

    this.amount = value;
    if (this.selectedResource) {
      this.onResourceSelected(this.selectedResource, Number.parseFloat(value));
    }
  };

  _onResourceSelectedHandler = (option: DropdownOption<Resource>): void => {
    this.selectedResource = option.value;
    const amount = Number.parseFloat(this.amount!);

    if (option.value) this.onResourceSelected(option.value, amount);
  };

  _validateAmount(amount: string): boolean {
    const parsedAmount = Number.parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      this.validationMessage = 'Amount must be greater than 0';
      return false;
    } else if (
      this.accountBalance &&
      parsedAmount > Number.parseFloat(this.accountBalance)
    ) {
      this.validationMessage = 'Amount exceeds account balance';
      return false;
    } else {
      this.validationMessage = null;
      return true;
    }
  }

  _renderBalance(): HTMLTemplateResult {
    return html`
      <section class="balanceContent">
        <span>${`${Number.parseFloat(this.accountBalance!).toFixed(4)}`}</span>
        <button class="maxButton" @click=${this._useMaxBalance}>Max</button>
      </section>
    `;
  }

  _renderAccountBalance(): HTMLTemplateResult {
    return when(this.accountBalance, () => this._renderBalance());
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
              value=${this.amount ||
              ifDefined(this.preselectedAmount).toString()}
            />
            <section class="selectorSection">
              <dropdown-component
                .selectedOption=${this.preselectedToken}
                ?disabled=${this.disabled}
                .onOptionSelected=${this._onResourceSelectedHandler}
                .options=${this._normalizeOptions()}
              >
              </dropdown-component>
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
