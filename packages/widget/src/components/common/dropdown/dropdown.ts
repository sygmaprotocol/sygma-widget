import type { PropertyValues, HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { when } from 'lit/directives/when.js';

import { chevronIcon, networkIconsMap } from '../../../assets';
import { capitalize } from '../../../utils';
import { BaseComponent } from '../base-component';

import { styles } from './styles';

export interface DropdownOption<T = Record<string, unknown>> {
  id?: string;
  name: string;
  customOptionHtml?: HTMLTemplateResult;
  icon?: HTMLTemplateResult | string;
  value: T;
}

@customElement('dropdown-component')
export class Dropdown extends BaseComponent {
  static styles = styles;

  @state()
  isDropdownOpen = false;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  placeholder = '';

  @property({ type: String })
  label? = '';

  @property({ type: Array })
  options: DropdownOption[] = [];

  @property({ type: String })
  preSelectedOption = '';

  @property({ type: Object })
  actionOption: HTMLTemplateResult | null = null;

  @property({ type: String })
  preSelectedOption = '';

  @state()
  selectedOption: DropdownOption | null = null;

  @property({ attribute: false })
  onOptionSelected: (option?: DropdownOption) => void = () => {};

  _setPreselectedOption = (): void => {
    if (this.preSelectedOption) {
      const newOption =
        this.options.find((o) => o.name === this.preSelectedOption) || null;

      if (newOption) {
        this.selectedOption = newOption;
        this.onOptionSelected(newOption);
      }
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this._setPreselectedOption();
    addEventListener('click', this._handleOutsideClick);
  }

  disconnectedCallback(): void {
    super.connectedCallback();
    removeEventListener('click', this._handleOutsideClick);
  }

  updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);

    // Set pre-selected option after transfer is completed
    if (
      changedProperties.has('options') &&
      this.preSelectedOption &&
      this.selectedOption?.name !== this.preSelectedOption
    ) {
      this._setPreselectedOption();
    }

    //if options changed, check if we have selected option that doesn't exist
    if (changedProperties.has('options') && this.selectedOption) {
      if (
        Array.isArray(this.options) &&
        !this.options.map((o) => o.value).includes(this.selectedOption.value)
      ) {
        if (this.preSelectedOption) {
          this._setPreselectedOption();
        } else {
          this.selectedOption = null;
          this.onOptionSelected(undefined);
        }
      }
    }
  }

  _handleOutsideClick = (event: MouseEvent): void => {
    if (this.isDropdownOpen && !event.composedPath().includes(this)) {
      document.removeEventListener('click', this._handleOutsideClick);
      this.isDropdownOpen = false;
    }
  };

  _toggleDropdown = (): void => {
    if (!this.disabled) {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  };

  _selectOption(option: DropdownOption, event: Event): void {
    if (this.disabled) return;

    event.stopPropagation();
    this.selectedOption = option;
    this._toggleDropdown();
    this.dispatchEvent(
      new CustomEvent('option-selected', { detail: { value: option.value } })
    );
    this.onOptionSelected(option);
  }

  _renderTriggerContent(): HTMLTemplateResult | undefined {
    // set first option as selected if no option is selected and there is no placeholder
    if (!this.placeholder && !this.selectedOption) {
      this.selectedOption = this.options[0];
    }

    return when(
      this.selectedOption,
      () =>
        html`${this.selectedOption!.icon || networkIconsMap.default}
          <span part="optionName" class="optionName">
            ${capitalize(this.selectedOption!.name)}
          </span>`,
      () =>
        when(
          this.placeholder,
          () => html`<span class="placeholder">${this.placeholder}</span>`
        )
    );
  }

  private renderOptionContent({
    customOptionHtml,
    name,
    icon
  }: DropdownOption): HTMLTemplateResult | undefined {
    return when(
      customOptionHtml,
      () => customOptionHtml,
      () => html`
        ${icon || ''}
        <span class="optionName">${capitalize(name)}</span>
      `
    );
  }

  _renderOptions(): Generator<unknown, void> | HTMLTemplateResult {
    return map(
      this.options,
      (option) => html`
        <div
          class="dropdownOption"
          @click="${(e: Event) => this._selectOption(option, e)}"
          role="option"
        >
          ${this.renderOptionContent(option)}
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
          slot="dropdown"
          part="dropdown"
          class="dropdown"
          @click="${this._toggleDropdown}"
          role="listbox"
          tabindex="0"
          aria-expanded="${this.isDropdownOpen ? 'true' : 'false'}"
        >
          <div
            part="dropdownTrigger"
            class="${this.disabled
              ? 'dropdownTrigger disabled'
              : 'dropdownTrigger'}"
          >
            <div class="selectedOption">${this._renderTriggerContent()}</div>
            <div class="chevron ${this.isDropdownOpen ? 'open' : ''}">
              ${chevronIcon}
            </div>
          </div>
          <div
            part="dropdownContent"
            class="dropdownContent ${this.isDropdownOpen ? 'show' : ''}"
            role="list"
          >
            ${this._renderOptions()} ${this.actionOption}
          </div>
        </div>
      </div>
    `;
  }
}
