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
      this.handleAddressChange({
        target: { value: this.address }
      } as unknown as Event);
    }
  }

  private handleAddressChange = ({ target }: Event): void => {
    const { value } = target as HTMLInputElement;

    if (this.errorMessage) {
      this.errorMessage = undefined;
    }

    if (!value) {
      return;
    }

    this.errorMessage = validateAddress(value, this.network);

    if (!this.errorMessage) {
      void this.onAddressChange(value);
    }
  };

  render(): HTMLTemplateResult {
    return html`<section class="inputAddressSection">
      <div class="inputAddressContainer">
        <label>Send to</label>
        ${when(
          this.errorMessage,
          () => html` <span class="errorMessage">${this.errorMessage}</span>`
        )}
        <input
          class=${this.errorMessage ? 'inputAddress error' : 'inputAddress'}
          name="address"
          type="text"
          @change=${this.handleAddressChange}
          value=${ifDefined(this.address)}
        />
      </div>
    </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-address-input': AddressInput;
  }
}
