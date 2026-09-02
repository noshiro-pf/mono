import {
  PercentFloat,
  Year,
  Yen,
  type RepaymentType,
} from '../types/index.mjs';

export const defaultValues = {
  repaymentType: 'principal-equal-payment',
  downPaymentManYen: Yen.cast(200),
  propertyPriceManYen: Yen.cast(2780),
  borrowingPeriodYear: Year.cast(35),
  interestRatePercentPerYear: PercentFloat.cast(0.5),
} as const satisfies Readonly<{
  repaymentType: RepaymentType;
  downPaymentManYen: Yen;
  propertyPriceManYen: Yen;
  borrowingPeriodYear: Year;
  interestRatePercentPerYear: PercentFloat;
}>;
