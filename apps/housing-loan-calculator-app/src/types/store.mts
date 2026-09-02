import { type PercentFloat } from './percent-float.mjs';
import { type RepaymentType } from './repayment-type.mjs';
import { type Year } from './year.mjs';
import { type Yen } from './yen.mjs';

export type Store = Readonly<{
  repaymentType: RepaymentType;
  /** 頭金（円） */
  downPaymentManYen: Yen;
  /** 物件の金額（円） */
  propertyPriceManYen: Yen;
  /** 借入期間（年） */
  borrowingPeriodYear: Year;
  /** 年当たりの金利 */
  interestRatePercentPerYear: PercentFloat;
}>;
