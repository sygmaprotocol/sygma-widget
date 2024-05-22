import { BigNumber, ethers } from 'ethers';
import type { UnsignedTransaction, type PopulatedTransaction } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import type { SubstrateTransaction } from '../controllers/transfers/fungible-token-transfer';
import { FungibleTransferState } from '../controllers/transfers/fungible-token-transfer';
import type { Eip1193Provider } from '../interfaces';

/**
 * This method calculate the amount of gas
 * list of transactions will cost
 * @param {number} chainId blockchain ID
 * @param {Eip1193Provider} eip1193Provider EIP compatible provider
 * @param {string} sender address of signer connected with provider
 * @param {PopulatedTransaction[]} transactions list of EVM transactions
 * @returns {Promise<BigNumber>} gas cost in 18 decimals // or chain native decimals
 */
export async function estimateEvmTransactionsGasCost(
  chainId: number,
  eip1193Provider: Eip1193Provider,
  sender: string,
  transactions: PopulatedTransaction[]
): Promise<BigNumber> {
  const provider = new Web3Provider(eip1193Provider, chainId);
  const signer = provider.getSigner(sender);

  let cost = ethers.constants.Zero;
  for (const transaction of transactions) {
    const _cost = await signer.estimateGas(transaction);
    cost = cost.add(_cost);
  }

  const gasPrice = await provider.getGasPrice();
  return gasPrice.mul(cost);
}

export async function estimateEvmGas(
  state: FungibleTransferState,
  chainId: number,
  provider: Eip1193Provider,
  address: string,
  pendingEvmApprovalTransactions: UnsignedTransaction[],
  pendingTransferTransaction: UnsignedTransaction
): Promise<BigNumber> {
  const transactions = [];

  switch (state) {
    case FungibleTransferState.PENDING_APPROVALS:
      transactions.push(...pendingEvmApprovalTransactions);
      break;
    case FungibleTransferState.PENDING_TRANSFER:
      transactions.push(pendingTransferTransaction);
      break;
  }

  const estimatedGas = await estimateEvmTransactionsGasCost(
    chainId,
    provider,
    address,
    transactions as PopulatedTransaction[]
  );

  return estimatedGas;
}

export async function estimateSubstrateGas(
  signerAddress: string,
  pendingTransferTransaction: SubstrateTransaction
): Promise<BigNumber> {
  const paymentInfo =
    await pendingTransferTransaction.paymentInfo(signerAddress);

  const { partialFee } = paymentInfo;
  const estimatedGas = BigNumber.from(partialFee.toString());

  return estimatedGas;
}
