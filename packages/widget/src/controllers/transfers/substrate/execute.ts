import type {
  FungibleTokenTransferController,
  SubstrateTransaction
} from '../fungible-token-transfer';

export async function executeNextSubstrateTransaction(
  this: FungibleTokenTransferController
): Promise<void> {
  this.errorMessage = null;
  const destinationAddress = this.destinationAddress;
  const sender = this.walletContext.value?.substrateWallet?.signerAddress;
  const signer = this.walletContext.value?.substrateWallet?.signer;
  if (
    this.pendingTransferTransaction === undefined ||
    destinationAddress == undefined ||
    sender == undefined ||
    this.sourceNetwork === undefined
  )
    return;

  const provider = this.sourceSubstrateProvider;
  this.waitingTxExecution = true;
  try {
    await (this.pendingTransferTransaction as SubstrateTransaction).signAndSend(
      sender,
      { signer: signer },
      ({ blockNumber, txIndex, status, dispatchError }) => {
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

        if (dispatchError) {
          if (dispatchError.isModule) {
            const decoded = provider?.registry.findMetaError(
              dispatchError.asModule
            );
            const [docs] = decoded?.docs || ['Transfer failed'];
            this.errorMessage = docs;
            this.waitingTxExecution = false;
            this.host.requestUpdate();
          }
        }
      }
    );
  } catch (error) {
    this.waitingUserConfirmation = false;
    this.waitingTxExecution = false;
  }
}
