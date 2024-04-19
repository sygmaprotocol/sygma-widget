import type { HTMLTemplateResult } from 'lit';
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { FungibleTransferState } from '../../../../controllers/transfers/fungible-token-transfer';
import type { Button } from '../../../common';
import { BaseComponent } from '../../../common';

const enabledStates = [
  FungibleTransferState.PENDING_APPROVALS,
  FungibleTransferState.PENDING_TRANSFER,
  FungibleTransferState.COMPLETED,
  FungibleTransferState.WRONG_CHAIN,
  FungibleTransferState.WALLET_NOT_CONNECTED
];

const loadingStates = [
  FungibleTransferState.WAITING_TX_EXECUTION,
  FungibleTransferState.WAITING_USER_CONFIRMATION,
  FungibleTransferState.UNKNOWN
];

@customElement('sygma-fungible-transfer-button')
export class FungibleTransferButton extends BaseComponent {
  @property({ type: Number })
  state: FungibleTransferState = FungibleTransferState.MISSING_SOURCE_NETWORK;

  @property({ type: Object })
  onClick: () => void = () => {};

  render(): HTMLTemplateResult {
    return html`<sygma-action-button
      .disabled=${!enabledStates.includes(this.state)}
      .isLoading=${loadingStates.includes(this.state)}
      .text=${choose(
        this.state,
        [
          [
            FungibleTransferState.MISSING_SOURCE_NETWORK,
            () => 'Select source network'
          ],
          [
            FungibleTransferState.MISSING_DESTINATION_NETWORK,
            () => 'Select destination network'
          ],
          [FungibleTransferState.MISSING_RESOURCE, () => 'Select token'],
          [
            FungibleTransferState.MISSING_RESOURCE_AMOUNT,
            () => 'Set token amount'
          ],
          [
            FungibleTransferState.MISSING_DESTINATION_ADDRESS,
            () => 'Add recipient'
          ],
          [FungibleTransferState.WALLET_NOT_CONNECTED, () => 'Connect Wallet'],
          [FungibleTransferState.WRONG_CHAIN, () => 'Switch chain'],
          [
            FungibleTransferState.INVALID_DESTINATION_ADDRESS,
            () => 'Invalid Address'
          ],
          [FungibleTransferState.PENDING_APPROVALS, () => 'Approve token'],
          [FungibleTransferState.PENDING_TRANSFER, () => 'Transfer'],
          [
            FungibleTransferState.WAITING_USER_CONFIRMATION,
            () => 'Please confirm in your wallet'
          ],
          [
            FungibleTransferState.WAITING_TX_EXECUTION,
            () => 'Waiting transaction confirmation'
          ],
          [FungibleTransferState.COMPLETED, () => 'Start new transfer']
        ],
        () => 'Loading'
      )}
      @click=${this.onClick}
    ></sygma-action-button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'sygma-fungible-transfer-button': Button;
  }
}
