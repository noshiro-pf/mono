import type { RepaymentType } from '../types';

export const defaultValues: {
  repaymentType: RepaymentType;
  downPayment: number;
  propertyPrice: number;
  borrowingPeriodYear: number;
  interestRatePercentPerYear: number;
} = {
  repaymentType: 'principal-equal-payment',
  downPayment: 200,
  propertyPrice: 2780,
  borrowingPeriodYear: 35,
  interestRatePercentPerYear: 0.5,
};
