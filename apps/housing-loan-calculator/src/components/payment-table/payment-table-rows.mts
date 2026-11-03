import type { FixedLengthTuple } from 'ts-type-forge';
import {
  Yen,
  type CalculatedValues,
  type RepaymentType,
} from '../../types/index.mjs';
import { formatYen } from '../../utils/index.mjs';

/**
 * One row per payment, numbered from 1: its number, the balance before it, its
 * interest, and the payment itself (元金均等返済) or its principal (元利均等返済).
 */
export const paymentTableRows = (
  repaymentType: RepaymentType,
  {
    borrowingBalanceYen,
    interestYen,
    monthlyPaymentTotalYen,
    monthlyPrincipalPaymentYen,
  }: CalculatedValues,
): readonly PaymentTableRow[] => {
  const monthlyPayment =
    repaymentType === 'principal-equal-payment'
      ? monthlyPaymentTotalYen
      : monthlyPrincipalPaymentYen;

  return borrowingBalanceYen.map((balance, i) => [
    (i + 1).toString(),
    formatYen(balance),
    formatYen(interestYen[i] ?? Yen.cast(0)),
    formatYen(monthlyPayment[i] ?? Yen.cast(0)),
  ]);
};

export type PaymentTableRow = FixedLengthTuple<4, string>;
