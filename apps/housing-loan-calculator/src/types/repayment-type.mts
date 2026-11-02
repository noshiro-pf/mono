/** The repayment types, in the order the page offers them. */
export const repaymentTypes = [
  'principal-equal-payment',
  'principal-and-interest-equal-repayment',
] as const;

/**
 * - `principal-and-interest-equal-repayment` : 元利均等返済
 * - `principal-equal-payment` : 元金均等返済
 */
export type RepaymentType = (typeof repaymentTypes)[number];
