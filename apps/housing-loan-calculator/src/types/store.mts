import type { BorrowingTotal } from './borrowing-total.mjs';
import type { PercentFloat } from './percent-float.mjs';
import type { RepaymentType } from './repayment-type.mjs';
import type { Year } from './year.mjs';

export type Store = Readonly<{
  repaymentType: RepaymentType;
  /** 借入金額（万円） */
  borrowingTotalManYen: BorrowingTotal;
  /** 借入期間（年） */
  borrowingPeriodYear: Year;
  /** 年当たりの金利 */
  interestRatePercentPerYear: PercentFloat;
}>;
