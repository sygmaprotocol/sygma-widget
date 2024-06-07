import {
  EVMAssetTransfer,
  FeeHandlerType
} from '@buildwithsygma/sygma-sdk-core';
import type {
  Domain,
  Environment,
  EvmFee,
  PercentageFee
} from '@buildwithsygma/sygma-sdk-core';
import { Web3Provider } from '@ethersproject/providers';
import type { UnsignedTransaction, BigNumber } from 'ethers';
import { constants, utils } from 'ethers';
import type { EvmWallet } from 'packages/widget/src/context';

type BuildEvmFungibleTransactionsArtifacts = {
  pendingEvmApprovalTransactions: UnsignedTransaction[];
  pendingTransferTransaction: UnsignedTransaction;
  fee: EvmFee;
  resourceAmount: BigNumber;
};

/**
 * @dev If we did proper validation this shouldn't throw.
 * Not sure how to handle if it throws :shrug:
 */
export async function buildEvmFungibleTransactions({
  evmWallet,
  chainId,
  destinationAddress,
  resourceId,
  resourceAmount,
  env,
  pendingEvmApprovalTransactions,
  pendingTransferTransaction,
  fee
}: {
  evmWallet: EvmWallet;
  chainId: number;
  destinationAddress: string;
  resourceId: string;
  resourceAmount: BigNumber;
  env: Environment;
  pendingEvmApprovalTransactions: UnsignedTransaction[];
  pendingTransferTransaction: UnsignedTransaction;
  sourceNetwork: Domain | null;
  fee: EvmFee;
}): Promise<BuildEvmFungibleTransactionsArtifacts> {
  const evmTransfer = new EVMAssetTransfer();
  await evmTransfer.init(
    new Web3Provider(evmWallet.provider, evmWallet.providerChainId),
    env
  );

  // Hack to make fungible transfer behave like it does on substrate side
  // where fee is deducted from user inputted amount rather than added on top
  const originalTransfer = await evmTransfer.createFungibleTransfer(
    evmWallet.address,
    chainId,
    destinationAddress,
    resourceId,
    resourceAmount.toString()
  );
  const originalFee = await evmTransfer.getFee(originalTransfer);
  // NOTE: for percentage fee, if both are equal, it means we can calculate the amount with fee avoiding second subtraction
  const calculateAmountWithFee = originalFee.type === FeeHandlerType.PERCENTAGE;

  //in case of percentage fee handler, we are calculating what amount + fee will result int user inputed amount
  //in case of fixed(basic) fee handler, fee is taken from native token
  if (calculateAmountWithFee) {
    const { lowerBound, upperBound, percentage } = originalFee as PercentageFee;
    const userInputAmount = resourceAmount;
    //calculate amount without fee (percentage)
    const feelessAmount = userInputAmount
      .mul(constants.WeiPerEther)
      .div(utils.parseEther(String(1 + percentage)));

    const calculatedFee = userInputAmount.sub(feelessAmount);
    resourceAmount = feelessAmount;
    //if calculated percentage fee is less than lower fee bound, substract lower bound from user input. If lower bound is 0, bound is ignored
    if (calculatedFee.lt(lowerBound) && lowerBound.gt(0)) {
      resourceAmount = userInputAmount.sub(lowerBound);
    }
    //if calculated percentage fee is more than upper fee bound, substract upper bound from user input. If upper bound is 0, bound is ignored
    if (calculatedFee.gt(upperBound) && upperBound.gt(0)) {
      resourceAmount = userInputAmount.sub(upperBound);
    }
  }

  const transfer = await evmTransfer.createFungibleTransfer(
    evmWallet.address,
    chainId,
    destinationAddress,
    resourceId,
    resourceAmount.toString()
  );
  fee = await evmTransfer.getFee(transfer);

  pendingEvmApprovalTransactions = await evmTransfer.buildApprovals(
    transfer,
    fee
  );

  pendingTransferTransaction = await evmTransfer.buildTransferTransaction(
    transfer,
    fee
  );
  return {
    pendingEvmApprovalTransactions,
    pendingTransferTransaction,
    fee,
    resourceAmount
  };
}
