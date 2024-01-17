import { Resource } from '@buildwithsygma/sygma-sdk-core';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './styles';
import { when } from 'lit/directives/when.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';

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

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedAmount?: number;

  inputRef: Ref<HTMLInputElement> = createRef();

  handleAmountChange(event: Event): void {
    const { value } = event.target as HTMLInputElement;

    this.selectedAmount = Number.parseFloat(value);

    dispatchEvent(
      new CustomEvent('amount-selector-change', {
        detail: value,
        bubbles: true,
        composed: true
      })
    );
  }

  useMaxBalance() {
    this.selectedAmount = Number.parseFloat(this.tokenBalance!);

    (this.inputRef.value as HTMLInputElement).value = `${this.selectedAmount}`;
    const event = new Event('input', {
      bubbles: true
    });

    this.inputRef.value?.dispatchEvent(event);
  }

  renderBalance() {
    return html`
      <section class="balanceContent">
        <span>${`${Number.parseFloat(this.tokenBalance!).toFixed(4)}`}</span>
        <button class="maxButton" @click=${this.useMaxBalance}>Max</button>
      </section>
    `;
  }

  render() {
    return html`
      <div class="amountSelectorContainer">
      <section class="tokenBalanceSection">
        <label class="amountSelectorLabel">Amount to transfer</label>
        ${when(this.tokenBalance, () => this.renderBalance())}
        </section>
        <section class="amountSelectorSection">
          <input 
          type="text" 
          class="amountSelectorInput" 
          placeholder="0" 
          @input=${this.handleAmountChange}
          value=${ifDefined(this.selectedAmount)}
          ${ref(this.inputRef)}
           />
          <base-selector
            .entries=${this.resources}
            .typeSelector=${'token'}
            .disabled=${this.disabled}
          ></base-selector>
          </section>
        </div>
      </div>
    `;
  }
}
