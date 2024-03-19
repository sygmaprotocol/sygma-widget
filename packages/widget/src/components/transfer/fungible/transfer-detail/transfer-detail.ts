import { FeeHandlerType } from '@buildwithsygma/sygma-sdk-core';
import type {
  BaseConfig,
  EvmFee,
  Network,
  Resource
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
  sourceDomainConfig?: BaseConfig<Network>;

  displayFee(): string {
    if (!this.fee) return '';
    let balance = '';
    let symbol = '';
    let decimals: number | undefined = undefined;
    const { type, fee } = this.fee;

    if (type === FeeHandlerType.PERCENTAGE) {
      if (this.selectedResource) {
        if (this.selectedResource.symbol) {
          symbol = this.selectedResource.symbol;
        }

        if (this.selectedResource.decimals) {
          decimals = this.selectedResource.decimals;
        }
      }
    }

    if (type === FeeHandlerType.BASIC) {
      if (this.sourceDomainConfig) {
        symbol = this.sourceDomainConfig.nativeTokenSymbol.toUpperCase();
        decimals = Number(this.sourceDomainConfig.nativeTokenDecimals);
      }
    }

    if (decimals) {
      balance = tokenBalanceToNumber(fee, decimals).toFixed(4);
    }

    return `${balance} ${symbol}`;
  }

  render(): HTMLTemplateResult {
    return html`
      <section class="transferDetail">
        ${when(
          this.fee !== undefined,
          () =>
            html`<div class="transferDetailContainer">
              <div class="transferDetailContainer-label">Fee</div>
              <div class="transferDetailContainer-value">
                ${this.displayFee()}
              </div>
            </div>`
        )}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-fungible-transfer-detail': FungibleTransferDetail;
  }
}
