import {
  BorrowingTotal,
  PercentFloat,
  Year,
  type RepaymentType,
} from '../types/index.mjs';

export const defaultValues = {
  repaymentType: 'principal-equal-payment',
  borrowingTotalManYen: BorrowingTotal.cast(2580),
  borrowingPeriodYear: Year.cast(35),
  interestRatePercentPerYear: PercentFloat.cast(0.5),
} as const satisfies Readonly<{
  repaymentType: RepaymentType;
  borrowingTotalManYen: BorrowingTotal;
  borrowingPeriodYear: Year;
  interestRatePercentPerYear: PercentFloat;
}>;
