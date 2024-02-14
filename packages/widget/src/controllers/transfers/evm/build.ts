import { EVMAssetTransfer } from '@buildwithsygma/sygma-sdk-core';
import {
  TransferState,
  type FungibleTokenTransferController
} from '../fungibleTokenTransfer';

/**
 * @dev If we did proper validation this shouldn't throw.
 * NBot sure how to handle if it throws :shrug:
 */
export async function buildEvmFungibleTransactions(
  this: FungibleTokenTransferController
): Promise<void> {
  //we already check that but this prevents those typescript errors
  if (
    !this.sourceNetwork ||
    !this.destinationNetwork ||
    !this.resourceAmount ||
    !this.selectedResource ||
    !this.destinatonAddress
  ) {
    return;
  }
  const provider = this.walletContext.value?.evmWallet?.provider;
  const address = this.walletContext.value?.evmWallet?.address;
  if (!provider || !address) return;

  const evmTransfer = new EVMAssetTransfer();
  await evmTransfer.init(provider, this.env);
  const transfer = await evmTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinatonAddress,
    this.selectedResource.resourceId,
    String(this.resourceAmount)
  );
  const fee = await evmTransfer.getFee(transfer);
  this.pendingEvmApprovalTransactions = await evmTransfer.buildApprovals(
    transfer,
    fee
  );
  this.pendingEvmTransferTransaction =
    await evmTransfer.buildTransferTransaction(transfer, fee);
  if (this.pendingEvmApprovalTransactions.length > 0) {
    this.transferState = TransferState.PENDING_APPROVALS;
  } else {
    this.transferState = TransferState.PENDING_TRANSFER;
  }
  this.host.requestUpdate();
}
