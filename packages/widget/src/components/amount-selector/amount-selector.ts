import type { Resource } from '@buildwithsygma/sygma-sdk-core';
import { utils, type BigNumber } from 'ethers';
import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import { networkIconsMap } from '../../assets';
import { TokenBalanceController } from '../../controllers/wallet-manager/token-balance';
import { tokenBalanceToNumber } from '../../utils/token';
import type { DropdownOption } from '../common/dropdown/dropdown';
import { DEFAULT_ETH_DECIMALS } from '../../constants';
import { BaseComponent } from '../common/base-component';
import { styles } from './styles';

@customElement('sygma-resource-selector')
export class AmountSelector extends BaseComponent {
  static styles = styles;

  @property({
    type: Array,
    hasChanged: (n, o) => n !== o
  })
  resources: Resource[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  preselectedToken?: string;

  @property({ attribute: false })
  /**
   * amount is in lowest denomination (it's up to parent component to get resource decimals)
   */
  onResourceSelected: (resource: Resource, amount: BigNumber) => void =
    () => {};

  @state() validationMessage: string | null = null;
  @state() selectedResource: Resource | null = null;
  @state() amount: number = 0;

  tokenBalanceController = new TokenBalanceController(this);

  _useMaxBalance = (): void => {
    this.amount = tokenBalanceToNumber(
      this.tokenBalanceController.balance,
      this.tokenBalanceController.decimals
    );
  };

  _onInputAmountChangeHandler = (event: Event): void => {
    const { value } = event.target as HTMLInputElement;
    if (!this._validateAmount(value)) return;

    this.amount = Number.parseFloat(value);
    if (this.selectedResource) {
      this.onResourceSelected(
        this.selectedResource,
        utils.parseUnits(
          this.amount.toString(),
          this.selectedResource.decimals ?? DEFAULT_ETH_DECIMALS
        )
      );
    }
  };

  _onResourceSelectedHandler = ({ value }: DropdownOption<Resource>): void => {
    this.selectedResource = value;
    this.amount = 0;
    this.tokenBalanceController.startBalanceUpdates(value);
  };

  _validateAmount(amount: string): boolean {
    const parsedAmount = Number.parseFloat(amount);
    if (isNaN(parsedAmount)) {
      this.validationMessage = 'Invalid amount value';
      return false;
    }
    if (parsedAmount < 0) {
      this.validationMessage = 'Amount must be greater than 0';
      return false;
    } else if (
      parsedAmount >
      tokenBalanceToNumber(
        this.tokenBalanceController.balance,
        this.tokenBalanceController.decimals
      )
    ) {
      this.validationMessage = 'Amount exceeds account balance';
      return false;
    } else {
      this.validationMessage = null;
      return true;
    }
  }

  _renderAccountBalance(): HTMLTemplateResult {
    return html`
      <section class="balanceContent">
        <span
          >${`${tokenBalanceToNumber(this.tokenBalanceController.balance, this.tokenBalanceController.decimals).toFixed(4)}`}</span
        >
        <button class="maxButton" @click=${this._useMaxBalance}>Max</button>
      </section>
    `;
  }

  _renderErrorMessages(): HTMLTemplateResult {
    return when(
      this.validationMessage,
      () => html`<div class="validationMessage">${this.validationMessage}</div>`
    );
  }

  _normalizeOptions(): DropdownOption<Resource>[] {
    return when(this.resources, () =>
      this.resources.map((entry) => ({
        id: entry.resourceId,
        name: entry.symbol!,
        icon: networkIconsMap.default,
        value: entry
      }))
    );
  }

  render(): HTMLTemplateResult {
    const amountSelectorContainerClasses = classMap({
      amountSelectorContainer: true,
      hasError: !!this.validationMessage
    });

    return html`
      <div class=${amountSelectorContainerClasses}>
        <section class="tokenBalanceSection">
          <label class="amountSelectorLabel">Amount to transfer</label>
          ${this._renderAccountBalance()}
        </section>
        <section class="amountSelectorSection">
          <div class="amountWrapper">
            <input
              type="number"
              class="amountSelectorInput"
              placeholder="0.000"
              @change=${this._onInputAmountChangeHandler}
              value=${this.amount.toString()}
            />
            <section class="selectorSection">
              <dropdown-component
                .preselectedOption=${this._normalizeOptions().filter(
                  (o) =>
                    o.id === this.preselectedToken ||
                    o.name === this.preselectedToken
                )}
                ?disabled=${this.disabled}
                .onOptionSelected=${this._onResourceSelectedHandler}
                .options=${this._normalizeOptions()}
              ></dropdown-component>
            </section>
          </div>
          <div class="errorWrapper">${this._renderErrorMessages()}</div>
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-resource-selector': AmountSelector;
  }
}
