import type { TransactionRequest } from '@ethersproject/providers';
import {
  TransferState,
  type FungibleTokenTransferController
} from '../fungibleTokenTransfer';

export async function executeNextEvmTransaction(
  this: FungibleTokenTransferController
): Promise<void> {
  this.errorMessage = null;
  const provider = this.walletContext.value?.evmWallet?.provider;
  const address = this.walletContext.value?.evmWallet?.address;
  //TODO: should set error message
  if (!provider || !address) return;
  const signer = provider.getSigner(address);
  if (this.transferState === TransferState.PENDING_APPROVALS) {
    this.transferState = TransferState.WAITING;
    this.host.requestUpdate();
    try {
      const tx = await signer.sendTransaction(
        this.pendingEvmApprovalTransactions[0] as TransactionRequest
      );
      await tx.wait();
      if (this.pendingEvmApprovalTransactions.shift() === undefined) {
        this.transferState = TransferState.PENDING_TRANSFER;
      }
      this.host.requestUpdate();
    } catch (e) {
      console.log(e);
      this.errorMessage = 'Approval transaction reverted or rejected';
      this.transferState = TransferState.PENDING_APPROVALS;
      this.host.requestUpdate();
    }
  }
  if (this.transferState === TransferState.PENDING_TRANSFER) {
    this.transferState = TransferState.WAITING;
    this.host.requestUpdate();
    try {
      const tx = await signer.sendTransaction(
        this.pendingEvmTransferTransaction! as TransactionRequest
      );
      await tx.wait();
      this.pendingEvmTransferTransaction = undefined;
      this.transferState = TransferState.COMPLETE;
      this.host.requestUpdate();
    } catch (e) {
      console.log(e);
      this.errorMessage = 'Transfer transaction reverted or rejected';
      this.transferState = TransferState.PENDING_TRANSFER;
      this.host.requestUpdate();
    }
  }
}
