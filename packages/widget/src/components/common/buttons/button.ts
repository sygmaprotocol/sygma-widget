import type { HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseComponent } from '../base-component/base-component';
import { loaderIcon } from '../../../assets';
import { buttonStyles } from './button.styles';

@customElement('sygma-button')
export class Button extends BaseComponent {
  static styles = buttonStyles;

  @property({})
  text: string = '';

  @property({ type: Object })
  onClick: () => void = () => {};

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean })
  isLoading: boolean = false;

  renderLoadingSpinner(): HTMLTemplateResult {
    return when(this.isLoading, () => loaderIcon);
  }

  render(): HTMLTemplateResult {
    const buttonClasses = classMap({
      button: true,
      disabled: this.disabled,
      loading: this.isLoading
    });

    return html`<button
      type="button"
      ?disabled="${this.disabled}"
      @click=${ifDefined(
        this.disabled || this.isLoading ? undefined : this.onClick
      )}
      class=${buttonClasses}
    >
      ${this.renderLoadingSpinner()} ${this.text}
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-button': Button;
  }
}

export default Button;
