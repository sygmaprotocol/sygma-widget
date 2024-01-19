import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './styles';
import { ifDefined } from 'lit/directives/if-defined.js';

@customElement('address-input')
export default class AddressInput extends LitElement {
  static styles = styles;
  @property({
    type: String
  })
  addressToTransfer?: string;

  @property()
  handleAddress?: (e: Event) => void;

  render() {
    return html`<section class="switch-container">
      <div class="input-address-container">
        <label>Send to</label>
        <input
          class="input-address"
          name="address"
          type="text"
          @change=${this.handleAddress}
          value=${ifDefined(this.addressToTransfer)}
        />
      </div>
    </section>`;
  }
}
