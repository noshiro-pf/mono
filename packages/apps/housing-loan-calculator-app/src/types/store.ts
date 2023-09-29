import { type PercentFloat } from './percent-float';
import { type RepaymentType } from './repayment-type';
import { type Yen } from './yen';

export type Store = Readonly<{
  repaymentType: RepaymentType;
  /** 頭金（円） */
  downPaymentManYen: Yen;
  /** 物件の金額（円） */
  propertyPriceManYen: Yen;
  /** 借入期間（年） */
  borrowingPeriodYear: SafeUint;
  /** 年当たりの金利 */
  interestRatePercentPerYear: PercentFloat;
}>;
