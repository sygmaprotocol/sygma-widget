import type { Environment } from '@buildwithsygma/sygma-sdk-core';
import type { SubstrateFee } from '@buildwithsygma/sygma-sdk-core/substrate';
import { SubstrateAssetTransfer } from '@buildwithsygma/sygma-sdk-core/substrate';
import type { ApiPromise } from '@polkadot/api';
import type { BigNumber } from 'ethers';
import type { SubstrateTransaction } from '../fungible-token-transfer';

type BuildSubstrateFungibleTransactionsArtifacts = {
  pendingTransferTransaction: SubstrateTransaction;
  resourceAmount: BigNumber;
  fee: SubstrateFee;
};

export async function buildSubstrateFungibleTransactions({
  address,
  substrateProvider,
  env,
  chainId,
  destinationAddress,
  resourceId,
  resourceAmount,
  pendingTransferTransaction,
  fee
}: {
  address: string;
  substrateProvider: ApiPromise;
  env: Environment;
  chainId: number;
  destinationAddress: string;
  resourceId: string;
  resourceAmount: BigNumber;
  pendingTransferTransaction: SubstrateTransaction;
  fee: SubstrateFee;
}): Promise<BuildSubstrateFungibleTransactionsArtifacts> {
  const substrateTransfer = new SubstrateAssetTransfer();
  await substrateTransfer.init(substrateProvider, env);

  const transfer = await substrateTransfer.createFungibleTransfer(
    address,
    chainId,
    destinationAddress,
    resourceId,
    String(resourceAmount)
  );

  fee = await substrateTransfer.getFee(transfer);

  if (resourceAmount.toString() === transfer.details.amount.toString()) {
    resourceAmount = resourceAmount.sub(fee.fee.toString());
  }

  pendingTransferTransaction = substrateTransfer.buildTransferTransaction(
    transfer,
    fee
  );

  return {
    pendingTransferTransaction,
    resourceAmount,
    fee
  };
}
