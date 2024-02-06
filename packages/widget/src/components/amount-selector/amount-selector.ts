import type { Resource } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import { BaseComponent } from '../base-component/base-component';
import type { DropdownOption } from '../internal/dropdown/dropdown';
import { networkIconsMap } from '../../assets';
import { styles } from './styles';

@customElement('sygma-resource-selector')
export class AmountSelector extends BaseComponent {
  static styles = styles;

  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  resources: Resource[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  accountBalance?: string;

  @property({ type: String })
  preselectedToken?: string;

  @property({ type: Number })
  preselectedAmount?: number;

  @property({ attribute: false })
  onResourceSelected?: (resource: Resource) => void;

  @property({ attribute: false })
  onAmountChange?: (amount: number) => void;

  @query('.amountSelectorInput', true)
  _input!: HTMLInputElement;

  @state() validationMessage: string | null = null;

  _useMaxBalance = (): void => {
    this.preselectedAmount = Number.parseFloat(this.accountBalance!);
    this._onInputAmountChange();
  };

  _onInputAmountChange = (): void => {
    const amount = this._input.value;
    if (this._validateAmount(amount)) {
      this.onAmountChange?.(Number.parseFloat(amount));
    }
  };

  _onResourceSelected = (option: DropdownOption): void => {
    const resource = this.resources.find(
      (resource) => String(resource.resourceId) == option.id
    );
    if (resource) this.onResourceSelected?.(resource);
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

  _normalizeOptions(): DropdownOption[] {
    return when(this.resources, () =>
      this.resources.map((entry) => ({
        id: entry.resourceId,
        name: entry.symbol!,
        icon: networkIconsMap.default
      }))
    );
  }

  render(): HTMLTemplateResult {
    return html`
      <div class="amountSelectorContainer">
        <section class="tokenBalanceSection">
          <label class="amountSelectorLabel">Amount to transfer</label>
          ${this._renderAccountBalance()}
        </section>
        <section class="amountSelectorSection">
          <div class="amountWrapper">
            <input
              type="text"
              class="amountSelectorInput"
              placeholder="0.000"
              @change=${this._onInputAmountChange}
              value=${ifDefined(this.preselectedAmount)}
            />
            <section class="selectorSection">
              <dropdown-component 
                .selectedOption=${this.preselectedToken}
                ?disabled=${this.disabled} 
                .onOptionSelected=${this._onResourceSelected}
                .options=${this._normalizeOptions()}
                >
            </section>
          </div>
          <div class="errorWrapper">
            ${this._renderErrorMessages()}
          </div>
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
