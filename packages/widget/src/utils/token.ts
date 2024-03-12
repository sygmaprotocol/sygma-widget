import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

export function tokenBalanceToNumber(
  amount: BigNumber,
  decimals: number,
  withFormattedDecimals = false
): number {
  const value = Number.parseFloat(utils.formatUnits(amount, decimals));

  if (withFormattedDecimals) {
    return tokenBalanceToNumberWithDecimals(value);
  }

  return value;
}

// This function is used to round the token balance to 4 decimal places
function tokenBalanceToNumberWithDecimals(value: number): number {
  return Math.floor(value * 10000) / 10000;
}
