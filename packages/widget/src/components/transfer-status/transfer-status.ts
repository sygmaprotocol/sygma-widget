import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { BaseComponent } from '../base-component/base-component';
import { greenMark, networkIconsMap } from '../../assets';
import { styles } from './styles';

@customElement('sygma-transfer-status')
export class TransferStatus extends BaseComponent {
  static styles = styles;

  @property({ type: String }) sourceNetworkName: string = '';

  @property({ type: String }) to: string = '';

  @property({ type: String }) amount: string = '';

  @property({ type: String }) tokenSymbol: string = '';

  @property({ type: String }) explorerLinkTo: string = '';

  renderNetworkIcon(name: string): HTMLTemplateResult {
    return networkIconsMap[name] || networkIconsMap.default;
  }

  render(): HTMLTemplateResult {
    return html`<section class="transferStatusContainer">
      <div>${greenMark}</div>
      <h3 class="transferStatusMainMessage">Started a transfer</h3>
      <div class="destinationMessage">
        <span class="networkIcon">
          From ${this.renderNetworkIcon(this.from)} ${this.from} to
          ${this.renderNetworkIcon(this.to)} ${this.to}
        </span>
      </div>
      <div class="tokenInfo">${this.amount} ${this.tokenSymbol}</div>
      <div class="transferStatusDescription">
        <span>
          Transfer is pending. You can check on the status of your transfer on
          <a
            href=${ifDefined(this.explorerLinkTo)}
            target="_blank"
            class="sygmaScanLink"
          >
            Sygma Scan
          </a>
        </span>
      </div>
    </section>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-transfer-status': TransferStatus;
  }
}
