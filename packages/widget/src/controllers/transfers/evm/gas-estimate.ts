import { Web3Provider } from '@ethersproject/providers';
import type { EIP1193Provider } from '@web3-onboard/core';
import { ethers, type BigNumber, type PopulatedTransaction } from 'ethers';

export async function estimateEvmTransactionsGasCost(
  chainId: number,
  eip1193Provider: EIP1193Provider,
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
