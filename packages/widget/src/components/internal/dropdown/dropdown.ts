import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';
import { chevronIcon, networkIconsMap } from '../../../assets';
import { capitalize } from '../../../utils';
import { BaseComponent } from '../../base-component/base-component';
import { styles } from './styles';

export interface DropdownOption {
  id?: string;
  name: string;
  icon?: HTMLTemplateResult | string;
}

@customElement('dropdown-component')
export class Dropdown extends BaseComponent {
  static styles = styles;

  @state()
  _isDropdownOpen = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  placeholder = '';

  @property({ type: String })
  label = '';

  @property({ type: Array })
  options: DropdownOption[] = [];

  @property({ type: Object })
  _selectedOption: DropdownOption | null = null;

  @property({ attribute: false })
  onOptionSelected: (option?: DropdownOption) => void = () => {};

  _toggleDropdown = (): void => {
    if (!this.disabled) {
      this._isDropdownOpen = !this._isDropdownOpen;
    }
  };

  _selectOption(option: DropdownOption, event: Event): void {
    if (!this.disabled) {
      event.stopPropagation();
      this._selectedOption = option;
      this._toggleDropdown();
      this.dispatchEvent(
        new CustomEvent('option-selected', { detail: { option } })
      );
      this.onOptionSelected?.(option);
    }
  }

  _renderTriggerContent(): HTMLTemplateResult {
    return when(
      this._selectedOption,
      () =>
        html`${this._selectedOption!.icon || networkIconsMap.default}
          <span class="optionName">
            ${capitalize(this._selectedOption!.name)}
          </span>`,
      () =>
        this.placeholder
          ? html`<span class="placeholder">${this.placeholder}</span>`
          : html``
    );
  }

  _renderOptions(): Generator<unknown, void> {
    return map(
      this.options,
      (option) => html`
        <div
          class="dropdownOption"
          @click="${(e: Event) => this._selectOption(option, e)}"
          role="option"
        >
          ${option.icon || ''}
          <span class="optionName">${capitalize(option.name)}</span>
        </div>
      `
    );
  }

  render(): HTMLTemplateResult {
    return html`
      <div
        part="dropdownWrapper"
        class="${this.disabled
          ? 'dropdownWrapper disabled'
          : 'dropdownWrapper'}"
      >
        <label for="selector" class="dropdownLabel">${this.label}</label>
        <div
          class="dropdown"
          @click="${this._toggleDropdown}"
          role="listbox"
          tabindex="0"
          aria-expanded="${this._isDropdownOpen ? 'true' : 'false'}"
        >
          <div
            class="${this.disabled
              ? 'dropdownTrigger disabled'
              : 'dropdownTrigger'}"
          >
            <div class="selectedOption">${this._renderTriggerContent()}</div>
            <div class="chevron ${this._isDropdownOpen ? 'open' : ''}">
              ${chevronIcon}
            </div>
          </div>
          <div
            class="dropdownContent ${this._isDropdownOpen ? 'show' : ''}"
            role="list"
          >
            ${this._renderOptions()}
          </div>
        </div>
      </div>
    `;
  }
}
