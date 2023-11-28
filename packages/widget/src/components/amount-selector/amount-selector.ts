import { RawConfig, Resource } from '@buildwithsygma/sygma-sdk-core';
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
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  domains?: RawConfig['domains'];

  @property({
    type: Boolean
  })
  disabled = false;

  @state({
    hasChanged: (n, o) => n !== o
  })
  selectedResourceId?: string;

  @property({
    type: Boolean,
    hasChanged: (n, o) => n !== o
  })
  isNativeToken?: boolean;

  @property({
    type: Object,
    hasChanged: (n, o) => n !== o
  })
  selectedDomain?: RawConfig['domains'][0];

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

  connectedCallback(): void {
    super.connectedCallback();
    addEventListener('base-selector-change', (event: unknown) => {
      const { detail } = event as CustomEvent;
      this.selectedResourceId = detail as string;
    });

    if (this.selectedDomain) {
      this.selectedNetworkChainId = this.selectedDomain.chainId;
    }
  }

  render() {
    return html`
      <div class="amountSelectorContainer">
        <label class="amountSelectorLabel">Amount to transfer</label>
        <section class="amountSelectorSection">
          <input type="number" class="amountSelectorInput" @input=${
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
