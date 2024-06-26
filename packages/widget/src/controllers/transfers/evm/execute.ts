import {
  Web3Provider,
  type TransactionRequest
} from '@ethersproject/providers';
import type { PopulatedTransaction } from 'ethers';
import type { Eip1193Provider } from '../../../interfaces';
import { estimateEvmTransactionsGasCost } from '../../../utils/gas';
import {
  FungibleTransferState,
  type FungibleTokenTransferController
} from '../fungible-token-transfer';

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
    const transactions: PopulatedTransaction[] = [];
    try {
      const tx = await signer.sendTransaction(
        this.pendingEvmApprovalTransactions[0] as TransactionRequest
      );
      this.waitingUserConfirmation = false;
      this.waitingTxExecution = true;
      this.host.requestUpdate();
      await tx.wait();
      this.pendingEvmApprovalTransactions.shift();

      transactions.push(
        ...(this.pendingEvmApprovalTransactions as PopulatedTransaction[]),
        this.pendingTransferTransaction as PopulatedTransaction
      );

      this.estimatedGas = await estimateEvmTransactionsGasCost(
        this.sourceNetwork?.chainId as number,
        this.walletContext.value?.evmWallet?.provider as Eip1193Provider,
        this.walletContext.value?.evmWallet?.address as string,
        transactions
      );
    } catch (e) {
      console.log(e);
      this.errorMessage = 'Approval transaction reverted or rejected';
    } finally {
      this.waitingUserConfirmation = false;
      this.waitingTxExecution = false;
      this.host.requestUpdate();
      await estimateEvmTransactionsGasCost(
        this.sourceNetwork?.chainId as number,
        this.walletContext.value?.evmWallet?.provider as Eip1193Provider,
        this.walletContext.value?.evmWallet?.address as string,
        transactions
      );
    }
    return;
  }
  if (this.getTransferState() === FungibleTransferState.PENDING_TRANSFER) {
    this.waitingUserConfirmation = true;
    this.host.requestUpdate();
    try {
      const tx = await signer.sendTransaction(
        this.pendingTransferTransaction! as TransactionRequest
      );
      this.waitingUserConfirmation = false;
      this.waitingTxExecution = true;
      this.host.requestUpdate();
      const receipt = await tx.wait();
      this.pendingTransferTransaction = undefined;
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
