import { asSafeUint, type SafeUint } from 'ts-data-forge';
import { PercentFloat, Yen, type RepaymentType } from '../types/index.mjs';

export const defaultValues = {
  repaymentType: 'principal-equal-payment',
  downPaymentManYen: Yen.cast(200),
  propertyPriceManYen: Yen.cast(2780),
  borrowingPeriodYear: asSafeUint(35),
  interestRatePercentPerYear: PercentFloat.cast(0.5),
} as const satisfies Readonly<{
  repaymentType: RepaymentType;
  downPaymentManYen: Yen;
  propertyPriceManYen: Yen;
  borrowingPeriodYear: SafeUint;
  interestRatePercentPerYear: PercentFloat;
}>;
