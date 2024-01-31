import { LitElement, html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import { when } from 'lit/directives/when.js';
import { validateAddress } from '../../utils';
import { styles } from './styles';

@customElement('sygma-address-input')
export class AddressInput extends LitElement {
  static styles = styles;
  @property({
    type: String
  })
  address: string = '';

  @property({ attribute: false })
  onAddressChange: (address: string) => void = () => {};

  @property({
    type: String
  })
  network: Network = Network.EVM;

  @state()
  errorMessage?: string;

  connectedCallback(): void {
    super.connectedCallback();
    if (this.address) {
      this.handleAddressChange(this.address);
    }
  }

  private handleAddressChange = (value: string): void => {
    const trimedValue = value.trim();

    if (this.errorMessage) {
      this.errorMessage = undefined;
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
          @change=${(evt: Event) =>
            this.handleAddressChange((evt.target as HTMLInputElement).value)}
          rows="2"
        >
${ifDefined(this.address)}
        </textarea
        >
      </div>
    </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-address-input': AddressInput;
  }
}
