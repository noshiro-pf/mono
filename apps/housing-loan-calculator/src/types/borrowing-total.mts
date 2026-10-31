import * as t from 'ts-fortress';

export const minBorrowingTotalManYen = 0;

export const maxBorrowingTotalManYen = 1_000_000;

/**
 * A borrowing total in 万円. Without a bound, a total typed in or given in the
 * URL could be negative, or so large that the yen figures calculated from it
 * become `Infinity`. The upper bound, 100億円, is past any housing loan, not a
 * limit of the calculation, whose figures stay finite at it
 * (`calc-all.test.mts`).
 */
export const BorrowingTotal = t.brand({
  baseType: t.number(0, {
    min: minBorrowingTotalManYen,
    max: maxBorrowingTotalManYen,
  }),
  defaultValue: 0,
  typeName: 'BorrowingTotal',
  brandKeys: ['BorrowingTotal'],
});

export type BorrowingTotal = t.TypeOf<typeof BorrowingTotal>;
