import { SubstrateAssetTransfer } from '@buildwithsygma/sygma-sdk-core/substrate';
import type { ApiPromise } from '@polkadot/api';
import { type FungibleTokenTransferController } from '../fungible-token-transfer';

export async function buildSubstrateFungibleTransactions(
  this: FungibleTokenTransferController
): Promise<void> {
  console.log('buildSubstrateFungibleTransactions');
  const address =
    this.walletContext.value?.substrateWallet?.accounts![0].address;
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
  await substrateTransfer.init(
    this.walletContext.value?.substrateWallet?.substrateProvider as ApiPromise,
    this.env
  );

  const transfer = await substrateTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinatonAddress,
    this.selectedResource.resourceId,
    String(this.resourceAmount)
  );

  const fee = await substrateTransfer.getFee(transfer);
  this.pendingTransferTransactions = substrateTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  this.host.requestUpdate();
}
