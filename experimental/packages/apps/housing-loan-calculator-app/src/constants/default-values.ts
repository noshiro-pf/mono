import { PercentFloat, Yen, type RepaymentType } from '../types';

export const defaultValues = {
  repaymentType: 'principal-equal-payment',
  downPaymentManYen: Yen.cast(200),
  propertyPriceManYen: Yen.cast(2780),
  borrowingPeriodYear: toSafeUint(35),
  interestRatePercentPerYear: PercentFloat.cast(0.5),
} as const satisfies Readonly<{
  repaymentType: RepaymentType;
  downPaymentManYen: Yen;
  propertyPriceManYen: Yen;
  borrowingPeriodYear: SafeUint;
  interestRatePercentPerYear: PercentFloat;
}>;
