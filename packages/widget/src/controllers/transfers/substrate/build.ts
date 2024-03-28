import { ParachainID, SubstrateAssetTransfer } from '@buildwithsygma/sygma-sdk-core/substrate';
import type { SubstrateConfig } from '@buildwithsygma/sygma-sdk-core';
import { type FungibleTokenTransferController } from '../fungible-token-transfer';

export async function buildSubstrateFungibleTransactions(
  this: FungibleTokenTransferController
): Promise<void> {
  const parachainId = this.getSourceParachainId();
  const address = this.walletContext.value?.substrateWallet?.signerAddress;

  if (
    !this.sourceNetwork ||
    !this.destinationNetwork ||
    !this.resourceAmount ||
    !this.selectedResource ||
    !this.destinatonAddress ||
    !parachainId ||
    !address
  ) {
    return;
  }

  const substrateProvider = this.getSubstrateProvider(parachainId);

  if (!substrateProvider) {
    return;
  }

  const substrateTransfer = new SubstrateAssetTransfer();
  await substrateTransfer.init(substrateProvider, this.env);

  const transfer = await substrateTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinatonAddress,
    this.selectedResource.resourceId,
    String(this.resourceAmount)
  );

  this.fee = await substrateTransfer.getFee(transfer);
  this.pendingTransferTransaction = substrateTransfer.buildTransferTransaction(
    transfer,
    this.fee
  );
  this.host.requestUpdate();
}
