import { type RepaymentType } from '../types';

export const defaultValues: {
  repaymentType: RepaymentType;
  downPaymentManYen: number;
  propertyPriceManYen: number;
  borrowingPeriodYear: number;
  interestRatePercentPerYear: number;
} = {
  repaymentType: 'principal-equal-payment',
  downPaymentManYen: 200,
  propertyPriceManYen: 2780,
  borrowingPeriodYear: 35,
  interestRatePercentPerYear: 0.5,
};
