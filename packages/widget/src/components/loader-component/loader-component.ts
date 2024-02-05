import { LitElement, html } from 'lit';
import type { HTMLTemplateResult } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { styles } from './styles';

@customElement('loader-component')
export class LoaderComponent extends LitElement {
  static styles = styles;

  @state()
  isLoading = false;

  @property({ attribute: false })
  onOpen: () => void = () => {};

  @property({ attribute: false })
  onClose: () => void = () => {};

  _open(): void {
    this.isLoading = true;
  }

  _close(): void {
    this.isLoading = false;
  }

  render(): HTMLTemplateResult {
    console.log('LoaderComponent');
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
