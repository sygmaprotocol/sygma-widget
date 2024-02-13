import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseComponent } from '../base-component/base-component';
import { greenMark, networkIconsMap } from '../../assets';
import { styles } from './styles';

@customElement('sygma-transfer-status')
export class TransferStatus extends BaseComponent {
  static styles = styles;

  @property({ type: String }) sourceNetworkName: string = '';

  @property({ type: String }) destinationNetworkName: string = '';

  @property({ type: Number }) amount: number = '';

  @property({ type: String }) resourceSymbol: string = '';

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
          From ${this.renderNetworkIcon(this.sourceNetworkName)}
          ${this.sourceNetworkName} to
          ${this.renderNetworkIcon(this.destinationNetworkName)}
          ${this.destinationNetworkName}
        </span>
      </div>
      <div class="tokenInfo">${this.amount} ${this.resourceSymbol}</div>
      <div class="transferStatusDescription">
        <span>
          Transfer is pending. You can check on the status of your transfer on
          <a href=${this.explorerLinkTo} target="_blank" class="sygmaScanLink">
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