import { SubstrateAssetTransfer } from '@buildwithsygma/sygma-sdk-core/substrate';
import { type FungibleTokenTransferController } from '../fungible-token-transfer';

export async function buildSubstrateFungibleTransactions(
  this: FungibleTokenTransferController
): Promise<void> {
  const substrateProvider = this.sourceSubstrateProvider;
  const address = this.walletContext.value?.substrateWallet?.signerAddress;

  if (
    !this.sourceNetwork ||
    !this.destinationNetwork ||
    !this.resourceAmount ||
    !this.selectedResource ||
    !this.destinationAddress ||
    !substrateProvider ||
    !address
  ) {
    this.estimatedGas = undefined;
    this.resetFee();
    return;
  }

  const substrateTransfer = new SubstrateAssetTransfer();
  await substrateTransfer.init(substrateProvider, this.env);

  const transfer = await substrateTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinationAddress,
    this.selectedResource.resourceId,
    String(this.resourceAmount)
  );

  this.fee = await substrateTransfer.getFee(transfer);

  if (this.resourceAmount.toString() === transfer.details.amount.toString()) {
    this.resourceAmount = this.resourceAmount.sub(this.fee.fee.toString());
  }

  this.pendingTransferTransaction = substrateTransfer.buildTransferTransaction(
    transfer,
    this.fee
  );
  await this.estimateGas();
  this.host.requestUpdate();
}
