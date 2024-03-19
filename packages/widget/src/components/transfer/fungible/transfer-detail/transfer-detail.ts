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

  getFeeParams(type: FeeHandlerType): { decimals?: number; symbol: string } {
    let decimals = undefined;
    let symbol = '';

    switch (type) {
      case FeeHandlerType.BASIC:
        if (this.sourceDomainConfig) {
          decimals = Number(this.sourceDomainConfig.nativeTokenDecimals);
          symbol = this.sourceDomainConfig.nativeTokenSymbol.toUpperCase();
        }
        return { decimals, symbol };
      case FeeHandlerType.DYNAMIC:
        if (this.selectedResource) {
          symbol = this.selectedResource.symbol ?? '';
          decimals = this.selectedResource.decimals ?? undefined;
        }
        return { decimals, symbol };
      default:
        return { decimals, symbol };
    }
  }

  getFee(): string {
    if (!this.fee) return '';
    const { symbol, decimals } = this.getFeeParams(this.fee.type);
    const { fee } = this.fee;
    let _fee = '';

    if (decimals) {
      _fee = tokenBalanceToNumber(fee, decimals).toFixed(4);
    }

    return `${_fee} ${symbol}`;
  }

  render(): HTMLTemplateResult {
    return html`
      <section class="transferDetail">
        ${when(
          this.fee !== undefined,
          () =>
            html`<div class="transferDetailContainer">
              <div class="transferDetailContainerLabel">Fee</div>
              <div class="transferDetailContainerValue">${this.getFee()}</div>
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
