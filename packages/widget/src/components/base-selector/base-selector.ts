import type { Domain, Resource } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { capitalize, renderNetworkIcon } from '../../utils';
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

  @property({
    type: Boolean
  })
  networkIcons = false;

  @property({
    type: Number
  })
  selectedNetworkChainId?: number;

  @property({
    type: Boolean
  })
  isHomechain = false;

  @property({
    type: Object
  })
  homechain?: Domain;

  onChange = (event: Event): void => {
    const { value } = event.target as HTMLInputElement;
    if (this.typeSelector === 'network') {
      dispatchEvent(
        new CustomEvent('network-change', {
          detail: value,
          bubbles: true,
          composed: true
        })
      );
    } else {
      dispatchEvent(
        new CustomEvent('token-change', {
          detail: value,
          bubbles: true,
          composed: true
        })
      );
    }
  };

  renderEntries(): Generator<unknown, void> {
    return map(this.entries, (entry: Domain | Resource, index: number) => {
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
              ? capitalize((entry as Domain).name)
              : (entry as Resource).symbol}
          </option>`;
      }
      return html`<option
        value=${this.typeSelector === 'network'
          ? (entry as Domain).chainId
          : (entry as Resource).resourceId}
      >
        ${this.typeSelector === 'network'
          ? capitalize((entry as Domain).name)
          : (entry as Resource).symbol}
      </option>`;
    });
  }

  render(): HTMLTemplateResult {
    return html`
      <section class="selectorSection">
        ${when(
          this.networkIcons,
          () => {
            if (this.typeSelector === 'network') {
              return renderNetworkIcon(this.selectedNetworkChainId);
            }
            return null;
          },
          () => null // do not render network icon slot
        )}
        <select
          @change=${this.onChange}
          ?disabled=${this.disabled}
          class="selector"
        >
          ${when(
            !this.isHomechain,
            () => this.renderEntries(),
            () =>
              html`<option selected value=${ifDefined(this.homechain?.chainId)}>
                ${capitalize(this.homechain?.name as string)}
              </option>`
          )}
        </select>
      </section>
    `;
  }
}
