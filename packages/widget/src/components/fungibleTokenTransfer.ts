import type { Domain } from '@buildwithsygma/sygma-sdk-core';
import { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { HTMLTemplateResult } from 'lit';
import { css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import '../context/wallet';
import {
  FungibleTokenTransferController,
  TransferState
} from '../controllers/transfers/fungibleTokenTransfer';
import './address-input';
import './amount-selector';
import { BaseComponent } from './base-component/base-component';
import './network-selector';
import { Directions } from './network-selector/network-selector';

@customElement('sygma-fungible-transfer')
export class FungibleTokenTransfer extends BaseComponent {
  static styles = css`
    :host {
      display: flex;
      justify-content: center;
    }
    form {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.25rem;
    }

    .actionButton {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      border-radius: 1rem;
      border: none;
      background-color: var(--primary-300);
      color: #ffffff;
      width: 19.625rem;
      padding: 0.75rem 1.25rem;
      font-weight: 500;
      font-size: 1rem;
    }

    .actionButton:disabled,
    .actionButton[disabled] {
      background-color: gray !important;
      cursor: not-allowed !important;
    }

    .actionButton:hover {
      cursor: pointer;
    }

    .actionButton:active {
      background-color: var(--primary-500);
    }

    .actionButtonReady:active {
      background-color: var(--primary-300);
    }

    .actionButtonReady:hover {
      cursor: pointer;
    }
  `;

  @property({ type: Array }) whitelistedSourceResources?: Array<string>;

  @property({ type: String })
  evironment: Environment = Environment.TESTNET;

  @property({ type: String })
  onSourceNetworkSelected?: (domain: Domain) => void;

  transferController = new FungibleTokenTransferController(this);

  connectedCallback(): void {
    super.connectedCallback();
    void this.transferController.init(this.evironment);
  }

  renderActionButton(): HTMLTemplateResult {
    return html` <button
      type="button"
      .disabled=${this.transferController.transferState ===
      TransferState.PREPARING}
      @click="${() => this.transferController.executeTransaction()}"
      class="actionButton actionButtonReady"
    >
      ${choose(this.transferController.transferState, [
        [TransferState.PREPARING, () => html`Please fill all the field`],
        [TransferState.PENDING_APPROVALS, () => html`Approve token`],
        [TransferState.PENDING_TRANSFER, () => html`Transfer`],
        [TransferState.WAITING, () => html`Waiting for transaction execution`],
        [TransferState.ERROR, () => html`Try again`]
      ])}
    </button>`;
  }

  render(): HTMLTemplateResult {
    return html` <form @submit=${() => {}}>
      <section class="networkSelectionWrapper">
        <sygma-network-selector
          .direction=${Directions.FROM}
          .icons=${true}
          .onNetworkSelected=${(network?: Domain) => {
            if (network) {
              this.onSourceNetworkSelected?.(network);
              this.transferController.onSourceNetworkSelected(network);
            }
          }}
          .networks=${this.transferController.supportedSourceNetworks}
        >
        </sygma-network-selector>
      </section>
      <section class="networkSelectionWrapper">
        <sygma-network-selector
          .direction=${Directions.TO}
          .icons=${true}
          .onNetworkSelected=${this.transferController
            .onDestinationNetworkSelected}
          .networks=${this.transferController.supportedDestinationNetworks}
        >
        </sygma-network-selector>
      </section>
      <section>
        <sygma-resource-selector
          .disabled=${!this.transferController.sourceNetwork ||
          !this.transferController.destinationNetwork}
          .resources=${this.transferController.supportedResources}
          .onResourceSelected=${this.transferController.onResourceSelected}
          accountBalance="0"
        >
        </sygma-resource-selector>
      </section>
      <section>
        <sygma-address-input
          .address=${this.transferController.destinatonAddress}
          .onAddressChange=${this.transferController.onDestinationAddressChange}
        >
        </sygma-address-input>
      </section>
      <section>${this.renderActionButton()}</section>
    </form>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-fungible-transfer': FungibleTokenTransfer;
  }
}
