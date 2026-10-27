/**
 * Local noon of `day` of `month` (1 to 12) of `year`, with a day or a month out
 * of its range carried over as `Date` does: day 0 is the last day of the
 * previous month, day 32 of January is February 1, month 13 is the next
 * January.
 *
 * Built with the setters, which take plain numbers: the strict standard
 * library narrows the `Date` constructor's month to 0–11 and its day to 1–31,
 * so `new Date(year, month - 1, day + days)` does not type-check there even
 * though ECMA-262 defines the carry. Noon, because no daylight saving
 * transition reaches it.
 */
export const localNoon = (year: number, month: number, day: number): Date => {
  const mut_date = new Date(0);

  mut_date.setHours(12, 0, 0, 0);

  mut_date.setFullYear(year, month - 1, day);

  return mut_date;
};

if (import.meta.vitest !== undefined) {
  describe(localNoon, () => {
    test('is noon of the day given', () => {
      const date = localNoon(2026, 10, 28);

      assert.deepStrictEqual(
        [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()],
        [2026, 9, 28, 12],
      );
    });

    test('takes day 0 for the last day of the previous month', () => {
      assert.strictEqual(localNoon(2024, 3, 0).getDate(), 29);

      assert.strictEqual(localNoon(2025, 3, 0).getDate(), 28);
    });

    test('carries a day past the end of the month into the next', () => {
      const date = localNoon(2026, 12, 32);

      assert.deepStrictEqual(
        [date.getFullYear(), date.getMonth(), date.getDate()],
        [2027, 0, 1],
      );
    });

    test('carries month 13 into the next year', () => {
      const date = localNoon(2026, 13, 1);

      assert.deepStrictEqual(
        [date.getFullYear(), date.getMonth(), date.getDate()],
        [2027, 0, 1],
      );
    });

    test('keeps a year below 100 as written', () => {
      assert.strictEqual(localNoon(50, 1, 1).getFullYear(), 50);
    });
  });
}
