import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { capitalize } from '../../utils';
import { networkIconsMap, chevronIcon } from '../../assets';
import { Component } from '../base-component/base-component';
import { styles } from './styles';

export const Directions = {
  FROM: 'From',
  TO: 'To'
} as const;

type Direction = (typeof Directions)[keyof typeof Directions];

@customElement('sygma-network-selector')
export class NetworkSelector extends Component {
  static styles = styles;

  @state()
  _isDropdownOpen = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  direction?: Direction;

  @property({ type: Object })
  selectedNetwork?: Domain;

  @property({ attribute: false })
  onNetworkSelected: (network?: Domain) => void = () => {};

  @property({ type: Array })
  networks: Domain[] = [];

  _toggleDropdown = (): void => {
    this._isDropdownOpen = !this._isDropdownOpen;
  };

  _selectOption(option: Domain, event: Event): void {
    event.stopPropagation();
    this.selectedNetwork = option;
    this._isDropdownOpen = false;
    this.onNetworkSelected?.(option);
  }

  _renderNetworkIcon(name: string): HTMLTemplateResult {
    return networkIconsMap[name] || networkIconsMap.default;
  }

  _renderEntries(): Generator<unknown, void> {
    return map(
      this.networks,
      (network: Domain) => html`
        <div
          class="dropdownOption"
          @click="${(e: Event) => this._selectOption(network, e)}"
          role="option"
        >
          ${this._renderNetworkIcon(network.name)}
          <span class="networkName">${capitalize(network.name)}</span>
        </div>
      `
    );
  }

  _renderTriggerContent(): HTMLTemplateResult {
    return when(
      this.selectedNetwork,
      () =>
        html`${this._renderNetworkIcon(this.selectedNetwork!.name)}
          <span class="networkName">
            ${capitalize(this.selectedNetwork!.name)}
          </span>`,
      () => html`Select Network`
    );
  }

  render(): HTMLTemplateResult {
    return html`<div class="selectorContainer">
      <label for="selector" class="directionLabel">${this.direction}</label>
      <div
        class="dropdown"
        @click="${this._toggleDropdown}"
        role="listbox"
        tabindex="0"
        aria-expanded="${this._isDropdownOpen ? 'true' : 'false'}"
      >
        <div class="dropdownTrigger">
          <div class="selectedNetwork">${this._renderTriggerContent()}</div>
          <div class="chevron ${this._isDropdownOpen ? 'open' : ''}">
            ${chevronIcon}
          </div>
        </div>
        <div
          class="dropdownContent ${this._isDropdownOpen ? 'show' : ''}"
          role="list"
        >
          ${this._renderEntries()}
        </div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-network-selector': NetworkSelector;
  }
}
