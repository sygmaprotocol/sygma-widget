import type { HTMLTemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import './connect';
import { Network } from './controllers';

@customElement('widget-root')
class WidgetRoot extends LitElement {
  render(): HTMLTemplateResult {
    return html`<wallet-manager-context-provider .network=${Network.EVM}>
      <sdk-manager-context-provider>
        <connect-dialog></connect-dialog>
      </sdk-manager-context-provider>
    </wallet-manager-context-provider>`;
  }
}

export { WidgetRoot };
