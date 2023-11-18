import { Domain, Resource } from '@buildwithsygma/sygma-sdk-core';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { styles } from './styles';

@customElement('base-selector')
export default class BaseSelector extends LitElement {
  static styles = styles;
  @property({
    type: Boolean
  })
  disabled = false;

  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  entries?: Domain[] | Resource[];

  @property({
    type: String
  })
  typeSelector: 'network' | 'token' = 'network';

  // eslint-disable-next-line class-methods-use-this
  onChange(event: Event): void {
    const { value } = event.target as HTMLInputElement;
    dispatchEvent(
      new CustomEvent('base-selector-change', {
        detail: value,
        bubbles: true,
        composed: true
      })
    );
  }

  render() {
    return html`
      <select
        @change=${this.onChange}
        ?disabled=${this.disabled}
        class="selector"
      >
        ${map(this.entries, (entry: Domain | Resource, index: number) => {
          if (index === 0) {
            return html`<option selected value="">
                ${this.typeSelector === 'network' ? 'Network' : 'Select Token'}
              </option>
              <option
                value=${this.typeSelector === 'network'
                  ? (entry as Domain).chainId
                  : (entry as Resource).resourceId}
              >
                ${this.typeSelector === 'network'
                  ? (entry as Domain).name
                  : (entry as Resource).symbol}
              </option>`;
          }
          return html`<option
            value=${this.typeSelector === 'network'
              ? (entry as Domain).chainId
              : (entry as Resource).resourceId}
          >
            ${this.typeSelector === 'network'
              ? (entry as Domain).name
              : (entry as Resource).symbol}
          </option>`;
        })}
      </select>
    `;
  }
}
