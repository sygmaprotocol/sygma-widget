import { html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import { when } from 'lit/directives/when.js';
import { validateAddress } from '../../utils';
import { BaseComponent } from '../base-component/base-component';
import { styles } from './styles';

@customElement('sygma-address-input')
export class AddressInput extends BaseComponent {
  static styles = styles;
  @property({
    type: String,
    attribute: true
  })
  address: string = '';

  @property({ attribute: false })
  onAddressChange: (address: string) => void = () => {};

  @property({
    type: String
  })
  network: Network = Network.EVM;

  @state()
  errorMessage: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.handleAddressChange(this.address);
  }

  private handleAddressChange = (value: string): void => {
    const trimedValue = value.replace(/\s+/g, '').trim();
    this.address = trimedValue;
    if (this.errorMessage) {
      this.errorMessage = null;
    }

    if (!trimedValue) {
      return;
    }

    this.errorMessage = validateAddress(trimedValue, this.network);

    if (!this.errorMessage) {
      void this.onAddressChange(trimedValue);
    }
  };

  render(): HTMLTemplateResult {
    return html` <section class="inputAddressSection">
      <div class="inputAddressContainer">
        <label class="labelContainer">
          <span>Send to </span>
          ${when(
            this.errorMessage,
            () => html` <span class="errorMessage">${this.errorMessage}</span>`
          )}</label
        >
        <textarea
          class=${this.errorMessage ? 'inputAddress error' : 'inputAddress'}
          name="address"
          .value=${this.address}
          @keypress=${(e: KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          @change=${(evt: Event) =>
            this.handleAddressChange((evt.target as HTMLInputElement).value)}
        ></textarea>
      </div>
    </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-address-input': AddressInput;
  }
}
