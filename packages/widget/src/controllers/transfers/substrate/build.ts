import { SubstrateAssetTransfer } from '@buildwithsygma/sygma-sdk-core/substrate';
import { type FungibleTokenTransferController } from '../fungible-token-transfer';

export async function buildSubstrateFungibleTransactions(
  this: FungibleTokenTransferController
): Promise<void> {
  console.log('buildSubstrateFungibleTransactions');
  const address =
    this.walletContext.value?.substrateWallet?.accounts![0].address;
  console.log('🚀 ~ address:', address);
  if (
    !this.sourceNetwork ||
    !this.destinationNetwork ||
    !this.resourceAmount ||
    !this.selectedResource ||
    !this.destinatonAddress ||
    !address
  ) {
    return;
  }

  const substrateTransfer = new SubstrateAssetTransfer();
  await substrateTransfer.init(api, this.env);

  const transfer = await substrateTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinatonAddress,
    this.selectedResource.resourceId,
    String(this.resourceAmount)
  );
  console.log('🚀 ~ transfer:', transfer);

  const fee = await substrateTransfer.getFee(transfer);
  console.log('🚀 ~ fee:', fee);
  this.transferTx = substrateTransfer.buildTransferTransaction(transfer, fee);
  console.log('🚀 ~ transferTx:', this.transferTx);
}
