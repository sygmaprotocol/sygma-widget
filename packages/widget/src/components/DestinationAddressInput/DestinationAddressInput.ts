import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('destination-address-input')
class DestinationAddressInput extends LitElement {
  render() {
    return html`<div>
      <label for="destination-address">Destination Address</label>
      <input id="destination-address" />
    </div>`;
  }
}

export { DestinationAddressInput };
