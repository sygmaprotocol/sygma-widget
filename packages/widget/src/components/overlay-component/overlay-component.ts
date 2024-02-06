import { LitElement, html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { styles } from './styles';

@customElement('sygma-overlay-component')
export class OverlayComponent extends LitElement {
  static styles = styles;

  @property({ type: Boolean })
  isLoading = false;

  render(): HTMLTemplateResult {
    return when(
      this.isLoading,
      () => html`
      <div class="loader">
        <div class="overlay">
          <div class="loading-spinner"></div>
          </div>
        </div>
      </div>`
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-overlay-component': OverlayComponent;
  }
}
