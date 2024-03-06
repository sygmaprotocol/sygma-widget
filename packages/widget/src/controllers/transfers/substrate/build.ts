import { SubstrateAssetTransfer } from '@buildwithsygma/sygma-sdk-core/substrate';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { type FungibleTokenTransferController } from '../fungible-token-transfer';

export async function buildSubstrateFungibleTransactions(
  this: FungibleTokenTransferController
): Promise<void> {
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
  const wssProvider = new WsProvider('wss://rhala-node.phala.network/ws');
  const api = await ApiPromise.create({ provider: wssProvider });
  await substrateTransfer.init(api, this.env);

  const transfer = await substrateTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinatonAddress,
    this.selectedResource.resourceId,
    String(this.resourceAmount)
  );

  const fee = await substrateTransfer.getFee(transfer);
  this.transferTx = substrateTransfer.buildTransferTransaction(transfer, fee);
}
