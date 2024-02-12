import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { networkIconsMap } from '../../assets';
import type { DropdownOption } from '../common/dropdown/dropdown';
import { BaseComponent } from '../base-component/base-component';
import { styles } from './styles';
import '../common/dropdown/dropdown';

export const Directions = {
  FROM: 'From',
  TO: 'To'
} as const;

type Direction = (typeof Directions)[keyof typeof Directions];

@customElement('sygma-network-selector')
export class NetworkSelector extends BaseComponent {
  static styles = styles;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  direction?: Direction;

  @property({ attribute: false })
  onNetworkSelected: (option?: Domain) => void = () => {};

  @property({ type: Array })
  networks: Domain[] = [];

  _onOptionSelected = ({ value }: DropdownOption<Domain>): void => {
    this.onNetworkSelected(value);
  };

  _renderNetworkIcon(name: string): HTMLTemplateResult {
    return networkIconsMap[name] || networkIconsMap.default;
  }

  _normalizeOptions(): DropdownOption<Domain>[] {
    return when(this.networks, () =>
      this.networks.map((network) => ({
        name: network.name,
        value: network,
        icon: this._renderNetworkIcon(network.name)
      }))
    );
  }

  render(): HTMLTemplateResult {
    return html`<div class="selectorContainer">
      <dropdown-component
        .disabled=${this.disabled}
        .placeholder=${'Select the network'}
        .label=${this.direction}
        .options=${this._normalizeOptions()}
        .onOptionSelected=${this._onOptionSelected}
      ></dropdown-component>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-network-selector': NetworkSelector;
  }
}
