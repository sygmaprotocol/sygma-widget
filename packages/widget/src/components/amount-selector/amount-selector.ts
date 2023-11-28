import { Resource } from '@buildwithsygma/sygma-sdk-core';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './styles';

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
          <input type="text" class="amountSelectorInput" @input=${
            this.handleAmountChange
          }
          placeholder="0" />
          <base-selector
            .entries=${this.resources}
            .typeSelector=${'token'}
            .disabled=${this.disabled}
            .networkIcons=${this.isNativeToken}
            .selectedNetworkChainId=${this.selectedNetworkChainId}
          ></base-selector>
          </section>
        </div>
      </div>
    `;
  }
}
