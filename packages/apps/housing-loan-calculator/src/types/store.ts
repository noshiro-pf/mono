import type { RepaymentType } from './repayment-type';

export type Store = DeepReadonly<{
  repaymentType: RepaymentType;
  downPaymentManYen: number; // 頭金（円）
  propertyPriceManYen: number; // 物件の金額（円）
  borrowingPeriodYear: number; // 借入期間（月）
  interestRatePercentPerYear: number; // 月当たりの金利
}>;
