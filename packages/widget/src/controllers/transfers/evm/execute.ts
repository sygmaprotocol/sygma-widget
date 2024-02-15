import {
  Web3Provider,
  type TransactionRequest
} from '@ethersproject/providers';
import {
  FungibleTransferState,
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
  const signer = new Web3Provider(provider).getSigner(address);
  if (this.getTransferState() === FungibleTransferState.PENDING_APPROVALS) {
    this.waitingUserConfirmation = true;
    this.host.requestUpdate();
    try {
      const tx = await signer.sendTransaction(
        this.pendingEvmApprovalTransactions[0] as TransactionRequest
      );
      this.waitingUserConfirmation = false;
      this.waitingTxExecution = true;
      this.host.requestUpdate();
      await tx.wait();
      this.pendingEvmApprovalTransactions.shift();
    } catch (e) {
      console.log(e);
      this.errorMessage = 'Approval transaction reverted or rejected';
    } finally {
      this.waitingUserConfirmation = false;
      this.waitingTxExecution = false;
      this.host.requestUpdate();
    }
    return;
  }
  if (this.getTransferState() === FungibleTransferState.PENDING_TRANSFER) {
    this.waitingUserConfirmation = true;
    this.host.requestUpdate();
    try {
      const tx = await signer.sendTransaction(
        this.pendingEvmTransferTransaction! as TransactionRequest
      );
      this.waitingUserConfirmation = false;
      this.waitingTxExecution = true;
      this.host.requestUpdate();
      const receipt = await tx.wait();
      this.pendingEvmTransferTransaction = undefined;
      this.transferTransactionId = receipt.transactionHash;
    } catch (e) {
      console.log(e);
      this.errorMessage = 'Transfer transaction reverted or rejected';
    } finally {
      this.waitingUserConfirmation = false;
      this.waitingTxExecution = false;
      this.host.requestUpdate();
    }
  }
}
