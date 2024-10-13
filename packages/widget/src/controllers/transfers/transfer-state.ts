import { ReactiveController, ReactiveElement } from 'lit';
import { SelectionsController } from './selections';
import { FungibleTransferState } from './fungible-token-transfer';
import { validateAddress } from '../../utils';
import { Network } from '@buildwithsygma/sygma-sdk-core';
import { ContextConsumer } from '@lit/context';
import { walletContext } from '../../context';

export class TransferStateController implements ReactiveController {
  walletContext: ContextConsumer<typeof walletContext, ReactiveElement>;
  host: ReactiveElement;

  hostConnected(): void {}

  constructor(host: ReactiveElement) {
    this.host = host;

    this.walletContext = new ContextConsumer(host, {
      context: walletContext,
      subscribe: true
    });
  }

  getTransferState(selections: SelectionsController): FungibleTransferState {
    const {
      recipientAddress,
      selectedResource,
      selectedDestination,
      selectedSource,
      transferAmount
    } = selections;

    // if (this.transferTransactionId) {
    //   return FungibleTransferState.COMPLETED;
    // }
    if (!selectedSource) {
      return FungibleTransferState.MISSING_SOURCE_NETWORK;
    }
    if (!selectedDestination) {
      return FungibleTransferState.MISSING_DESTINATION_NETWORK;
    }
    if (!selectedResource) {
      return FungibleTransferState.MISSING_RESOURCE;
    }
    if (!transferAmount || transferAmount.eq(0)) {
      return FungibleTransferState.MISSING_RESOURCE_AMOUNT;
    }
    if (
      recipientAddress === null ||
      recipientAddress === undefined ||
      (selectedDestination.type &&
        validateAddress(recipientAddress, selectedDestination.type))
    ) {
      return FungibleTransferState.INVALID_DESTINATION_ADDRESS;
    }
    if (recipientAddress === '') {
      return FungibleTransferState.MISSING_DESTINATION_ADDRESS;
    }
    // if (this.waitingUserConfirmation) {
    //   return FungibleTransferState.WAITING_USER_CONFIRMATION;
    // }
    // if (this.waitingTxExecution) {
    //   return FungibleTransferState.WAITING_TX_EXECUTION;
    // }
    // if (this.pendingEvmApprovalTransactions.length > 0) {
    //   return FungibleTransferState.PENDING_APPROVALS;
    // }
    // if (this.pendingTransferTransaction) {
    //   return FungibleTransferState.PENDING_TRANSFER;
    // }
    if (
      !this.walletContext.value?.evmWallet &&
      !this.walletContext.value?.substrateWallet
    ) {
      return FungibleTransferState.WALLET_NOT_CONNECTED;
    }
    if (
      selectedSource.type === Network.EVM &&
      this.walletContext.value?.evmWallet?.providerChainId !==
        selectedSource.chainId
    ) {
      return FungibleTransferState.WRONG_CHAIN;
    }
    // if (this.waitingUserConfirmation) {
    //   return FungibleTransferState.WAITING_USER_CONFIRMATION;
    // }
    // if (this.waitingTxExecution) {
    //   return FungibleTransferState.WAITING_TX_EXECUTION;
    // }
    // if (this.transferTransactionId) {
    //   return FungibleTransferState.COMPLETED;
    // }
    // if (this.pendingEvmApprovalTransactions.length > 0) {
    //   return FungibleTransferState.PENDING_APPROVALS;
    // }
    // if (this.pendingTransferTransaction) {
    //   return FungibleTransferState.PENDING_TRANSFER;
    // }
    return FungibleTransferState.UNKNOWN;
  }
}
