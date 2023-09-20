import {
  toPercentFloat,
  toYen,
  type PercentFloat,
  type RepaymentType,
  type Yen,
} from '../types';

export const defaultValues = {
  repaymentType: 'principal-equal-payment',
  downPaymentManYen: toYen(200),
  propertyPriceManYen: toYen(2780),
  borrowingPeriodYear: 35,
  interestRatePercentPerYear: toPercentFloat(0.5),
} as const satisfies Readonly<{
  repaymentType: RepaymentType;
  downPaymentManYen: Yen;
  propertyPriceManYen: Yen;
  borrowingPeriodYear: SafeUint;
  interestRatePercentPerYear: PercentFloat;
}>;
