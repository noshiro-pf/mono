import { expectType } from 'ts-data-forge';
import { BorrowingTotal } from './borrowing-total.mjs';

// Branded: a number has to be checked to become one.
expectType<BorrowingTotal, number>('<=');

expectType<number, BorrowingTotal>('!<=');

describe('BorrowingTotal', () => {
  test('accepts totals in 0-1,000,000 万円', () => {
    expect(BorrowingTotal.cast(0)).toBe(0);

    expect(BorrowingTotal.cast(2580.5)).toBe(2580.5);

    expect(BorrowingTotal.cast(1_000_000)).toBe(1_000_000);
  });

  test('rejects totals outside 0-1,000,000 万円', () => {
    expect(() => BorrowingTotal.cast(-1)).toThrow();

    expect(() => BorrowingTotal.cast(1_000_001)).toThrow();

    expect(() => BorrowingTotal.cast(1e305)).toThrow();
  });

  test('rejects a total that is not a finite number', () => {
    expect(() => BorrowingTotal.cast(Number.NaN)).toThrow();

    expect(() => BorrowingTotal.cast(Number.POSITIVE_INFINITY)).toThrow();
  });
});
