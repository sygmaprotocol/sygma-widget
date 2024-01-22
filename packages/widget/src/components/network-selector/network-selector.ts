import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { LitElement, html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { capitalize } from '../../utils';
import { styles } from './styles';

const directions = {
  from: 'From',
  to: 'To'
};

@customElement('sygma-network-selector')
export class NetworkSelector extends LitElement {
  static styles = styles;

  @property({
    type: Boolean
  })
  disabled = false;

  @property({
    type: Boolean
  })
  icons = true;

  @property({
    type: String
  })
  direction?: 'from' | 'to';

  @property({
    type: Object,
    hasChanged: (n, o) => n !== o
  })
  selected?: Domain;

  @property({
    attribute: false
  })
  onNetworkSelected?: (network: Domain | undefined) => void;

  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  networks: Domain[] = [];

  onChange(event: Event): void {
    const { value } = event.target as HTMLOptionElement;
    const network = this.networks.find((n) => String(n.chainId) == value);
    this.onNetworkSelected?.(network);
  }

  renderEntries(): Generator<unknown, void> | HTMLTemplateResult {
    if (this.networks) {
      return map(this.networks, (entry: Domain) => {
        // TODO: render network icon
        return html`<option value=${entry.chainId} class="network-option">
          ${capitalize(entry.name)}
        </option>`;
      });
    }
    return html`<option selected value="">Network</option>`;
  }

  render(): HTMLTemplateResult {
    return html` <div class="selectorContainer">
      <label for="selector" class="directionLabel"
        >${this.direction && directions[this.direction]}</label
      >
      <section class="selectorSection">
        <select
          @change=${(event: Event) => this.onChange.bind(this)(event)}
          ?disabled=${this.disabled}
          class="selector"
        >
          <option class="network-option" value="-1">-</option>
          ${this.renderEntries()}
        </select>
      </section>
    </div>`;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    'sygma-network-selector': NetworkSelector;
  }
}
