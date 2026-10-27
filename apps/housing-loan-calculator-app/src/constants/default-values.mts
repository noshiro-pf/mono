import {
  PercentFloat,
  Year,
  Yen,
  type RepaymentType,
} from '../types/index.mjs';

export const defaultValues = {
  repaymentType: 'principal-equal-payment',
  borrowingTotalManYen: Yen.cast(2580),
  borrowingPeriodYear: Year.cast(35),
  interestRatePercentPerYear: PercentFloat.cast(0.5),
} as const satisfies Readonly<{
  repaymentType: RepaymentType;
  borrowingTotalManYen: Yen;
  borrowingPeriodYear: Year;
  interestRatePercentPerYear: PercentFloat;
}>;
