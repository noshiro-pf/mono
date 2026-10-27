import type { PercentFloat } from './percent-float.mjs';
import type { RepaymentType } from './repayment-type.mjs';
import type { Year } from './year.mjs';
import type { Yen } from './yen.mjs';

export type Store = Readonly<{
  repaymentType: RepaymentType;
  /** 借入金額（万円） */
  borrowingTotalManYen: Yen;
  /** 借入期間（年） */
  borrowingPeriodYear: Year;
  /** 年当たりの金利 */
  interestRatePercentPerYear: PercentFloat;
}>;
