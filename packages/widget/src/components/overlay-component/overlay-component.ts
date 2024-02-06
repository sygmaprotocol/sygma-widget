import { LitElement, html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { styles } from './styles';

@customElement('sygma-overlay-component')
export class OverlayComponent extends LitElement {
  static styles = styles;

  render(): HTMLTemplateResult {
    return html` <div class="loader">
      <div class="overlay">
        <div class="loadingSpinner"></div>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-overlay-component': OverlayComponent;
  }
}
