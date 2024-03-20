import { BigNumber, utils } from 'ethers';

export function tokenBalanceToNumber(
  amount: BigNumber,
  decimals: number,
  formattedDecimals?: number
): string {
  let value = utils.formatUnits(amount, decimals);

  if (formattedDecimals) {
    let valueBigNumber = utils.parseUnits(value, decimals);
    const factor = BigNumber.from(10).pow(formattedDecimals);
    valueBigNumber = valueBigNumber
      .mul(factor)
      .div(BigNumber.from(10).pow(decimals));
    value = utils.formatUnits(valueBigNumber, formattedDecimals);
  }

  return value;
}
