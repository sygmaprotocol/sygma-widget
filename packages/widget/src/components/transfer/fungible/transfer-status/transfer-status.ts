import type { BigNumber } from 'ethers';
import { ethers, utils } from 'ethers';
import { html, type HTMLTemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BaseComponent } from '../../../common';
import { greenMark, networkIconsMap } from '../../../../assets';
import { DEFAULT_ETH_DECIMALS } from '../../../../constants';
import { styles } from './styles';

@customElement('sygma-transfer-status')
export class TransferStatus extends BaseComponent {
  static styles = styles;

  @property({ type: String }) sourceNetworkName: string = '';

  @property({ type: String }) destinationNetworkName: string = '';

  @property({ type: Object }) amount: BigNumber = ethers.constants.Zero;

  @property({ type: Number }) tokenDecimals: number = DEFAULT_ETH_DECIMALS;

  @property({ type: String }) resourceSymbol: string = '';

  @property({ type: String }) explorerLinkTo: string = '';

  renderNetworkIcon(name: string): HTMLTemplateResult {
    return networkIconsMap[name] || networkIconsMap.default;
  }

  formatAmount(amount: BigNumber): string {
    const formatedAmount = utils.formatUnits(amount, this.tokenDecimals);
    return `${Number.parseFloat(formatedAmount).toFixed(4)}`;
  }

  render(): HTMLTemplateResult {
    return html`<section class="transferStatusContainer">
      <div>${greenMark}</div>
      <h3 class="transferStatusMainMessage">Started a transfer</h3>
      <div class="destinationMessage">
        <span class="networkIcon">
          From ${this.renderNetworkIcon(this.sourceNetworkName ?? '')}
          ${this.sourceNetworkName ?? 'Unknown'} to
          ${this.renderNetworkIcon(this.destinationNetworkName ?? '')}
          ${this.destinationNetworkName ?? 'Unknown'}
        </span>
      </div>
      <div class="tokenInfo">
        ${this.formatAmount(this.amount ?? ethers.constants.Zero)}
        ${this.resourceSymbol}
      </div>
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
