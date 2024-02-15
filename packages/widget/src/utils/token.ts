import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

export function tokenBalanceToNumber(
  amount: BigNumber,
  decimals: number
): number {
  return Number.parseFloat(utils.formatUnits(amount, decimals));
}
