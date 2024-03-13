import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

export function tokenBalanceToNumber(
  amount: BigNumber,
  decimals: number,
  formattedDecimals?: number
): number {
  const value = Number.parseFloat(utils.formatUnits(amount, decimals));

  if (formattedDecimals) {
    return tokenBalanceToNumberWithDecimals(value, formattedDecimals);
  }

  return value;
}

// This function is used to round the token balance to the correct number of decimals
function tokenBalanceToNumberWithDecimals(
  value: number,
  formattedDecimals: number
): number {
  const factor = Math.pow(10, formattedDecimals);
  return Math.floor(value * factor) / factor;
}
