import { sum } from '@noshiro/ts-utils';
import { calcPrincipalAndInterestEqualPayment } from '../functions/calc-principal-and-interest-equal-repayment';
import { calcPrincipalEqualPayment } from '../functions/calc-principal-equal-payment';
import { RepaymentType } from '../types/enum/repayment-type';

export const calcAll = (
  repaymentType: RepaymentType,
  downPaymentManYen: number,
  propertyPriceManYen: number,
  borrowingPeriodYear: number,
  interestRatePercentPerYear: number
): {
  borrowingBalanceYen: number[];
  interestYen: number[];
  monthlyPaymentTotalYen: number[];
  monthlyPrincipalPaymentYen: number[];
  fixedPrincipalYenPerMonth: number;
  fixedMonthlyPaymentsYen: number;
  interestSumManYen: number;
} => {
  /**
   * 1 -> 元金均等返済
   * 2 -> 元利均等返済
   */
  const downPaymentYen = downPaymentManYen * 10000;
  const propertyPriceYen = propertyPriceManYen * 10000;
  const borrowingPeriodMonth = borrowingPeriodYear * 12;
  const interestRatePerMonth = interestRatePercentPerYear / (100 * 12);

  const borrowingTotalYen = propertyPriceYen - downPaymentYen; // 借入金額

  const {
    fixedPrincipalYenPerMonth,
    borrowingBalanceYen: borrowingBalanceYen1,
    interestYen: interestYen1,
    monthlyPaymentTotalYen,
  } = calcPrincipalEqualPayment({
    borrowingPeriodMonth,
    borrowingTotalYen,
    interestRatePerMonth,
  });

  const {
    borrowingBalanceYen: borrowingBalanceYen2,
    interestYen: interestYen2,
    monthlyPrincipalPaymentYen,
    fixedMonthlyPaymentsYen,
  } = calcPrincipalAndInterestEqualPayment({
    borrowingPeriodMonth,
    borrowingTotalYen,
    interestRatePerMonth,
  });

  const borrowingBalanceYen =
    repaymentType === 'principal-equal-payment'
      ? borrowingBalanceYen1
      : borrowingBalanceYen2;

  const interestYen =
    repaymentType === 'principal-equal-payment' ? interestYen1 : interestYen2;

  const interestSumManYen = sum(interestYen) / 10000;

  return {
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
    fixedPrincipalYenPerMonth,
    fixedMonthlyPaymentsYen,
    interestSumManYen,
  };
};
