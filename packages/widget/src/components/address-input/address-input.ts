import { LitElement, html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ethers } from 'ethers';
import { validatePolkadotAddress } from '../../utils';
import { styles } from './styles';

@customElement('sygma-address-input')
export class AddressInput extends LitElement {
  static styles = styles;
  @property({
    type: String
  })
  address: string = '';

  @property()
  handleAddress?: (address: string) => void;

  @property({
    type: Object
  })
  network?: 'substrate' | 'evm';

  private handleAddressChange = ({ target }: Event): void => {
    const { value } = target as HTMLInputElement;
    if (this.network !== 'evm') {
      const validPolkadotAddress = validatePolkadotAddress(value);

      if (validPolkadotAddress) {
        return void this.handleAddress?.(value);
      }
      // TODO: if not defined or show error
    } else {
      const isAddress = ethers.utils.isAddress(value);
      if (isAddress) {
        return void this.handleAddress?.(value);
      }
      // TODO: if not defined or show error
    }
  };

  render(): HTMLTemplateResult {
    return html`<section class="address-input-container">
      <div class="input-address-container">
        <label>Send to</label>
        <input
          class="input-address"
          name="address"
          type="text"
          @change=${(evt: Event) => this.handleAddressChange.bind(this)(evt)}
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
