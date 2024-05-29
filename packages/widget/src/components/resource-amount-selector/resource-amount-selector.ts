import {
  Network,
  type EthereumConfig,
  type Resource,
  type SubstrateConfig
} from '@buildwithsygma/sygma-sdk-core';
import type { PropertyValues } from '@lit/reactive-element';
import { BigNumber, utils } from 'ethers';
import type { HTMLTemplateResult, PropertyDeclaration } from 'lit';
import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { when } from 'lit/directives/when.js';
import { networkIconsMap } from '../../assets';
import { DEFAULT_ETH_DECIMALS } from '../../constants';
import {
  BALANCE_UPDATE_KEY,
  TokenBalanceController
} from '../../controllers/wallet-manager/token-balance';
import { tokenBalanceToNumber } from '../../utils/token';
import type { DropdownOption } from '../common/dropdown/dropdown';
import { BaseComponent } from '../common/base-component';
import { styles } from './styles';
import { debounce } from 'lodash';
@customElement('sygma-resource-amount-selector')
export class ResourceAmountSelector extends BaseComponent {
  static styles = styles;

  @property({ type: Array })
  resources: Resource[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  preselectedToken?: string;

  @property({ attribute: false })
  /**
   * amount is in the lowest denomination (it's up to parent component to get resource decimals)
   */
  onResourceSelected: (resource: Resource, amount: BigNumber) => void =
    () => {};

  @property({ type: Object })
  sourceDomainConfig?: EthereumConfig | SubstrateConfig;

  @state() selectedResource: Resource | null = null;
  @state() validationMessage: string | null = null;
  @state() amount: string = '';

  tokenBalanceController = new TokenBalanceController(this);

  _useMaxBalance = (): void => {
    this.amount = tokenBalanceToNumber(
      this.tokenBalanceController.balance,
      this.tokenBalanceController.decimals
    );
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


  _onInputAmountChangeHandler = (value: string): void => {
    if (value === '') {
      value = '0';
    }
    try {
      const amount = utils.parseUnits(
        value,
        this.tokenBalanceController.decimals
      );
      this.amount = value;
      if (!this._validateAmount(value)) return;
      if (this.selectedResource) {
        this.onResourceSelected(this.selectedResource, BigNumber.from(amount));
      }
    } catch (error) {
      console.log('error', error);
      this.validationMessage = 'Invalid amount value';
    }
  };

  debouncedHandler = debounce(this._onInputAmountChangeHandler, 300)

  requestUpdate(
    name?: PropertyKey,
    oldValue?: unknown,
    options?: PropertyDeclaration<unknown, unknown>
  ): void {
    super.requestUpdate(name, oldValue, options);
    if (name === BALANCE_UPDATE_KEY) {
      this._validateAmount(String(this.amount));
    }
  }

  _onResourceSelectedHandler = (option?: DropdownOption<Resource>): void => {
    if (option) {
      this.selectedResource = option.value;
      this.amount = '';
      this.tokenBalanceController.startBalanceUpdates(
        this.selectedResource,
        this.sourceDomainConfig?.type === Network.SUBSTRATE
          ? this.sourceDomainConfig
          : undefined
      );
    } else {
      this.selectedResource = null;
      this.tokenBalanceController.resetBalance();
    }
  };

  _validateAmount(amount: string): boolean {
    if (amount === '') {
      amount = '0';
    }
    try {
      const parsedAmount = utils.parseUnits(
        amount,
        this.tokenBalanceController.decimals
      );

      if (parsedAmount.lte(BigNumber.from(0))) {
        this.validationMessage = 'Amount must be greater than 0';
        return false;
      }

      if (parsedAmount.gt(this.tokenBalanceController.balance)) {
        this.validationMessage = 'Amount exceeds account balance';
        return false;
      }

      this.validationMessage = null;
      return true;
    } catch (error) {
      this.validationMessage = 'Invalid amount value';
      return false;
    }
  }

  _renderAccountBalance(): HTMLTemplateResult {
    return html`
      <section class="balanceContent">
        <span
          >${`${tokenBalanceToNumber(this.tokenBalanceController.balance, this.tokenBalanceController.decimals, 4)}`}</span
        >
        <button class="maxButton" @click=${this._useMaxBalance}>Max</button>
      </section>
    `;
  }

  _renderErrorMessages(): HTMLTemplateResult {
    return when(
      this.validationMessage,
      () =>
        html` <div class="validationMessage">${this.validationMessage}</div>`
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

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('selectedResource')) {
      if (changedProperties.get('selectedResource') !== null) {
        this.tokenBalanceController.resetBalance();
        this.amount = '';
      }
    }
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
              @input=${(_evt: any) => {
                this.debouncedHandler(_evt.target.value)
              }}
              .disabled=${this.disabled}
              .value=${this.amount}
            />
            <section class="selectorSection">
              <dropdown-component
                .placeholder=${'Select token'}
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
    'sygma-resource-amount-selector': ResourceAmountSelector;
  }
}
