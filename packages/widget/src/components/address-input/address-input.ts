import { Network } from '@buildwithsygma/sygma-sdk-core';
import { html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import type { PropertyValues } from '@lit/reactive-element';
import { validateAddress } from '../../utils';
import { BaseComponent } from '../common/base-component';

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
  networkType: Network = Network.EVM;

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
      void this.onAddressChange('');
      return;
    }

    this.errorMessage = validateAddress(trimedValue, this.networkType);
    this.onAddressChange(trimedValue);
  };

  protected updated(changedProperties: PropertyValues): void {
    //revalidating address on network change
    if (changedProperties.has('networkType')) {
      this.handleAddressChange(this.address);
    }
  }

  render(): HTMLTemplateResult {
    return html`<section class="inputAddressSection">
      <div class="inputAddressContainer">
        <label class="labelContainer">
          <span>Send to </span>
          ${when(
            this.errorMessage,
            () => html`<span class="errorMessage">${this.errorMessage}</span>`
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
          @input=${(evt: Event) =>
            this.handleAddressChange((evt.target as HTMLTextAreaElement).value)}
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
