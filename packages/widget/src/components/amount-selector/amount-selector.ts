import type { Resource } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { styles } from './styles';

@customElement('sygma-resource-selector')
export class AmountSelector extends LitElement {
  static styles = styles;
  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  resources: Resource[] = [];

  @property({
    type: Boolean
  })
  disabled = false;

  @property({
    type: String
  })
  accountBalance?: string;

  @property({
    type: String
  })
  preselectedToken?: string;

  @property({
    type: Number,
    hasChanged: (n, o) => n !== o
  })
  preselectedAmount?: number;

  @property({
    attribute: false
  })
  onResourceSelected?: (resource: Resource) => void;

  @property({
    attribute: false
  })
  onAmountChange?: (amount: number) => void;

  @query('.amountSelectorInput', true)
  _input!: HTMLInputElement;

  useMaxBalance = (): void => {
    this.preselectedAmount = Number.parseFloat(this.accountBalance!);
    this._onInputAmountChange();
  };

  _onInputAmountChange = (): void => {
    const amount = Number.parseFloat(this._input.value);
    this.onAmountChange?.(amount);
  };
  _onResourceSelected = (event: Event): void => {
    const { value } = event.target as HTMLOptionElement;
    const resource = this.resources.find((n) => String(n.resourceId) == value);
    if (resource) {
      this.onResourceSelected?.(resource);
    }
  };

  renderBalance(): HTMLTemplateResult {
    return html`
      <section class="balanceContent">
        <span>${`${Number.parseFloat(this.accountBalance!).toFixed(4)}`}</span>
        <button class="maxButton" @click=${this.useMaxBalance}>Max</button>
      </section>
    `;
  }

  renderEntries(): Generator<unknown, void> | HTMLTemplateResult {
    if (this.resources) {
      return map(this.resources, (entry: Resource) => {
        // TODO: render resource/token icon
        return html`<option value=${entry.resourceId}>${entry.symbol}</option>`;
      });
    }
    return html`<option selected value="">Token</option>`;
  }

  render(): HTMLTemplateResult {
    return html`
      <div class="amountSelectorContainer">
        <section class="tokenBalanceSection">
          <label class="amountSelectorLabel">Amount to transfer</label>
          ${when(this.accountBalance, () => this.renderBalance())}
        </section>
        <section class="amountSelectorSection">
          <input
            type="text"
            class="amountSelectorInput"
            placeholder="0.000"
            @change=${this._onInputAmountChange}
            value=${ifDefined(this.preselectedAmount)}
          />
          <section class="selectorSection">
            <select
              @change=${this._onResourceSelected}
              ?disabled=${this.disabled}
              class="selector amountSelectorInput"
            >
              <option value="-1">-</option>
              ${this.renderEntries()}
            </select>
          </section>
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
