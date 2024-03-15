import {
  FeeHandlerType,
  type Domain,
  type EvmFee,
  type Resource
} from '@buildwithsygma/sygma-sdk-core';
import '../../../common/buttons/button';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { customElement, property } from 'lit/decorators.js';
import { tokenBalanceToNumber } from '../../../../utils/token';
import { BaseComponent } from '../../../common/base-component';
import { styles } from './styles';

@customElement('sygma-fungible-transfer-detail')
export class FungibleTransferDetail extends BaseComponent {
  static styles = styles;

  @property({ type: Object })
  fee?: EvmFee;

  @property({ type: Object })
  selectedResource?: Resource;

  @property({ type: Object })
  sourceNetwork?: Domain;

  displayFee(): string {
    if (!this.fee) return '';
    let balance = '';
    let symbol = '';

    if (this.fee.type === FeeHandlerType.PERCENTAGE) {
      if (this.selectedResource) {
        if (this.selectedResource.symbol) {
          symbol = this.selectedResource.symbol;
        }

        if (this.selectedResource.decimals) {
          balance = tokenBalanceToNumber(
            this.fee.fee,
            this.selectedResource?.decimals
          ).toFixed(4);
        }
      }
    }
    // ? show other types of fee
    return `${balance} ${symbol}`;
  }

  render(): HTMLTemplateResult {
    return html`
      ${when(
        this.fee !== undefined,
        () =>
          html`<div class="transferDetailBox">
            <div class="transferDetailBox-label">Fee</div>
            <div class="transferDetailBox-value">${this.displayFee()}</div>
          </div>`
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-fungible-transfer-detail': FungibleTransferDetail;
  }
}
