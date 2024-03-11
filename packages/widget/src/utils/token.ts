import type { BigNumber } from 'ethers';
import { utils } from 'ethers';

export function tokenBalanceToNumber(
  amount: BigNumber,
  decimals: number
): number {
  return Number.parseFloat(utils.formatUnits(amount, decimals));
}

export function truncateBigNumberToString(
  value: BigNumber,
  decimals: number,
  displayDecimals: number = 4
): string {
  const valueStr = utils.formatUnits(value, decimals);

  const parts = valueStr.split('.');
  const integerPart = parts[0];
  let decimalPart = parts.length > 1 ? parts[1] : '';

  decimalPart = decimalPart.slice(0, displayDecimals);

  if (displayDecimals === 0) return integerPart;

  return `${integerPart},${decimalPart}`;
}
