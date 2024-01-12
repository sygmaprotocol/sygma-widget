import { Resource } from '@buildwithsygma/sygma-sdk-core';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './styles';
import { when } from 'lit/directives/when.js';

@customElement('amount-selector')
export default class AmountSelector extends LitElement {
  static styles = styles;
  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  resources?: Resource[];

  @property({
    type: Boolean
  })
  disabled = false;

  @property({
    type: Boolean,
    hasChanged: (n, o) => n !== o
  })
  isNativeToken?: boolean;

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedNetworkChainId?: number;

  @property({
    type: Number
  })
  tokenBalance?: string;

  @property({
    type: String
  })
  tokenName?: string;

  // eslint-disable-next-line class-methods-use-this
  handleAmountChange(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    dispatchEvent(
      new CustomEvent('amount-selector-change', {
        detail: value,
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <div class="amountSelectorContainer">
        <label class="amountSelectorLabel">Amount to transfer</label>
        <section class="amountSelectorSection">
          <input 
          type="text" 
          class="amountSelectorInput" 
          placeholder="0" 
          @input=${this.handleAmountChange}
           />
          <base-selector
            .entries=${this.resources}
            .typeSelector=${'token'}
            .disabled=${this.disabled}
          ></base-selector>
          </section>
          <section class="tokenBalanceSection">
            ${when(
              this.tokenBalance,
              () => html`<span>${`Balance: ${this.tokenBalance}`}</span>`
            )}
            </section>
        </div>
      </div>
    `;
  }
}
