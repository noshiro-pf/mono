import { PercentFloat, Yen, type CalculatedValues, type Store } from '../types';
import { calcPrincipalAndInterestEqualPayment } from './calc-principal-and-interest-equal-repayment';
import { calcPrincipalEqualPayment } from './calc-principal-equal-payment';

export const calcAll = ({
  repaymentType,
  downPaymentManYen,
  propertyPriceManYen,
  borrowingPeriodYear,
  interestRatePercentPerYear,
}: Store): CalculatedValues => {
  /**
   * - 1 -> 元金均等返済
   * - 2 -> 元利均等返済
   */
  const downPaymentYen = Yen.cast(downPaymentManYen * 10_000);
  const propertyPriceYen = Yen.cast(propertyPriceManYen * 10_000);
  const borrowingPeriodMonth = Uint32.mul(borrowingPeriodYear, 12);
  const interestRatePerMonth = PercentFloat.cast(
    interestRatePercentPerYear / 1200,
  );

  const borrowingTotalYen = Yen.cast(propertyPriceYen - downPaymentYen); // 借入金額

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

  const interestSumManYen = Yen.cast(Arr.sum(interestYen) / 10_000);

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
