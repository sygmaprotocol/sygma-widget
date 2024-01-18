import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './styles';
import { when } from 'lit/directives/when.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '@material/web/switch/switch';

@customElement('address-input')
export default class AddressInput extends LitElement {
  static styles = styles;
  @property({
    type: String
  })
  selectedAddress?: string;

  @property({
    type: Boolean
  })
  selected: boolean = false;

  @property()
  handleSwitch?: (e: Event) => void;

  @property()
  handleAddress?: (e: Event) => void;

  renderInputAddress() {
    return html`
      <div class="input-address-container">
        <label>Send to</label>
        <input
          class="input-address"
          name="address"
          type="text"
          @change=${this.handleAddress}
          value=${ifDefined(this.selectedAddress)}
        />
      </div>
    `;
  }

  render() {
    return html`<section class="switch-container">
      <div class="switch-toggle-container">
        <span>
          <md-switch
            class="switcher"
            .selected=${this.selected}
            @change=${this.handleSwitch}
          ></md-switch>
        </span>
        <span> Transfer to the different address </span>
      </div>
      ${when(this.selected, () => this.renderInputAddress())}
    </section>`;
  }
}
