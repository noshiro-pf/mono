import { type RepaymentType } from '../types';

export const defaultValues = {
  repaymentType: 'principal-equal-payment',
  downPaymentManYen: 200,
  propertyPriceManYen: 2780,
  borrowingPeriodYear: 35,
  interestRatePercentPerYear: 0.5,
} as const satisfies Readonly<{
  repaymentType: RepaymentType;
  downPaymentManYen: number;
  propertyPriceManYen: number;
  borrowingPeriodYear: Uint32;
  interestRatePercentPerYear: number;
}>;
