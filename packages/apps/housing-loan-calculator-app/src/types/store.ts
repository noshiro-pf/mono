import { type RepaymentType } from './repayment-type';

export type Store = Readonly<{
  repaymentType: RepaymentType;
  /** 頭金（円） */
  downPaymentManYen: number;
  /** 物件の金額（円） */
  propertyPriceManYen: number;
  /** 借入期間（月） */
  borrowingPeriodYear: Uint32;
  /** 月当たりの金利 */
  interestRatePercentPerYear: number;
}>;
