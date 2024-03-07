import { EVMAssetTransfer } from '@buildwithsygma/sygma-sdk-core';
import { Web3Provider } from '@ethersproject/providers';
import { type FungibleTokenTransferController } from '../fungible-token-transfer';

/**
 * @dev If we did proper validation this shouldn't throw.
 * Not sure how to handle if it throws :shrug:
 */
export async function buildEvmFungibleTransactions(
  this: FungibleTokenTransferController
): Promise<void> {
  //we already check that but this prevents those typescript errors
  const provider = this.walletContext.value?.evmWallet?.provider;
  const providerChaiId = this.walletContext.value?.evmWallet?.providerChainId;
  const address = this.walletContext.value?.evmWallet?.address;
  if (
    !this.sourceNetwork ||
    !this.destinationNetwork ||
    !this.resourceAmount ||
    !this.selectedResource ||
    !this.destinatonAddress ||
    !provider ||
    !address ||
    providerChaiId !== this.sourceNetwork.chainId
  ) {
    return;
  }

  const evmTransfer = new EVMAssetTransfer();
  await evmTransfer.init(new Web3Provider(provider, providerChaiId), this.env);
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
  this.pendingTransferTransactions = await evmTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  this.host.requestUpdate();
}
