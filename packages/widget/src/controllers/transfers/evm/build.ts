import {
  EVMAssetTransfer,
  FeeHandlerType,
  type PercentageFee
} from '@buildwithsygma/sygma-sdk-core';
import { Web3Provider } from '@ethersproject/providers';
import { constants, utils } from 'ethers';
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
    !this.destinationAddress ||
    !provider ||
    !address ||
    providerChaiId !== this.sourceNetwork.chainId
  ) {
    this.resetFee();
    return;
  }

  const evmTransfer = new EVMAssetTransfer();
  await evmTransfer.init(new Web3Provider(provider, providerChaiId), this.env);

  // Hack to make fungible transfer behave like it does on substrate side
  // where fee is deducted from user inputted amount rather than added on top
  const originalTransfer = await evmTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinationAddress,
    this.selectedResource.resourceId,
    this.resourceAmount.toString()
  );
  const originalFee = await evmTransfer.getFee(originalTransfer);
  //in case of percentage fee handler, we are calculating what amount + fee will result int user inputed amount
  //in case of fixed(basic) fee handler, fee is taken from native token
  if (originalFee.type === FeeHandlerType.PERCENTAGE) {
    const { lowerBound, upperBound, percentage } = originalFee as PercentageFee;
    const userInputAmount = this.resourceAmount;
    //calculate amount without fee (percentage)
    const feelessAmount = userInputAmount
      .mul(constants.WeiPerEther)
      .div(utils.parseEther(String(1 + percentage)));

    const calculatedFee = userInputAmount.sub(feelessAmount);
    this.resourceAmount = feelessAmount;
    //if calculated percentage fee is less than lower fee bound, substract lower bound from user input. If lower bound is 0, bound is ignored
    if (calculatedFee.lt(lowerBound) && lowerBound.gt(0)) {
      this.resourceAmount = userInputAmount.sub(lowerBound);
    }
    //if calculated percentage fee is more than upper fee bound, substract upper bound from user input. If upper bound is 0, bound is ignored
    if (calculatedFee.gt(upperBound) && upperBound.gt(0)) {
      this.resourceAmount = userInputAmount.sub(upperBound);
    }
  }

  const transfer = await evmTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinationAddress,
    this.selectedResource.resourceId,
    this.resourceAmount.toString()
  );
  this.fee = await evmTransfer.getFee(transfer);
  this.pendingEvmApprovalTransactions = await evmTransfer.buildApprovals(
    transfer,
    this.fee
  );
  this.pendingEvmTransferTransaction =
    await evmTransfer.buildTransferTransaction(transfer, this.fee);
  this.host.requestUpdate();
}
