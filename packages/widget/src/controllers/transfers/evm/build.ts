import {
  EVMAssetTransfer,
  FeeHandlerType
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
    return;
  }

  const evmTransfer = new EVMAssetTransfer();
  await evmTransfer.init(new Web3Provider(provider, providerChaiId), this.env);

  // Hack to make fungible transfer behave like it does on substrate side
  // where fee is deducted from user inputted amount rather than added on top
  const originalTransfer = await evmTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinatonAddress,
    this.selectedResource.resourceId,
    this.resourceAmount.toString()
  );
  const originalFee = await evmTransfer.getFee(originalTransfer);
  //in case of percentage fee handler, we are calculating what amount + fee will result int user inputed amount
  //in case of fixed fee handler, fee is taken from native token
  if (originalFee.type === FeeHandlerType.PERCENTAGE) {
    const feePercentage = originalFee.fee
      .mul(constants.WeiPerEther)
      .div(this.resourceAmount);

    this.resourceAmount = this.resourceAmount
      .mul(constants.WeiPerEther)
      .div(
        utils.parseEther(
          String(1 + Number.parseFloat(utils.formatEther(feePercentage)))
        )
      );
  }

  const transfer = await evmTransfer.createFungibleTransfer(
    address,
    this.destinationNetwork.chainId,
    this.destinationAddress,
    this.selectedResource.resourceId,
    this.resourceAmount.toString()
  );
  const fee = await evmTransfer.getFee(transfer);
  transfer.details;
  this.pendingEvmApprovalTransactions = await evmTransfer.buildApprovals(
    transfer,
    fee
  );
  this.pendingEvmTransferTransaction =
    await evmTransfer.buildTransferTransaction(transfer, fee);
  this.host.requestUpdate();
}
