import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { SubmittableResult } from '@polkadot/api';
import type { FungibleTokenTransferController } from '../fungible-token-transfer';

export async function executeNextSubstrateTransaction(
  this: FungibleTokenTransferController
): Promise<void> {
  this.errorMessage = null;
  const destinationAddress = this.destinatonAddress;
  const sender = this.walletContext.value?.substrateWallet?.signerAddress;
  const signer = this.walletContext.value?.substrateWallet?.signer;
  if (
    this.pendingTransferTransaction === undefined ||
    destinationAddress == undefined ||
    sender == undefined
  )
    return;

  await (
    this.pendingTransferTransaction as SubmittableExtrinsic<
      'promise',
      SubmittableResult
    >
  ).signAndSend(
    sender,
    { signer: signer },
    ({ blockNumber, txIndex, isError, status }) => {
      if (status.isInBlock) {
        this.waitingTxExecution = false;
        this.pendingTransferTransaction = undefined;
        this.transferTransactionId = `${blockNumber?.toString()}-${txIndex?.toString()}`;
        this.host.requestUpdate();
      }

      if (status.isBroadcast) {
        this.waitingUserConfirmation = false;
        this.host.requestUpdate();
      }

      if (isError) {
        this.errorMessage = 'Transfer transaction reverted or rejected';
        this.waitingTxExecution = false;
        this.host.requestUpdate();
      }
    }
  );
}
