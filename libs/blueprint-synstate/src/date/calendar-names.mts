/**
 * The names a calendar is drawn with in `locale`, from `Intl`: what
 * Blueprint takes from a date-fns locale, which is not loaded here.
 */
export type CalendarNames = Readonly<{
  /** January to December, as the month select lists them. */
  months: readonly string[];
  /** Sunday to Saturday, short, as the head of the grid shows them. */
  weekdaysShort: readonly string[];
  /** Sunday to Saturday, in full, as the head of the grid reads them out. */
  weekdaysLong: readonly string[];
  /** The month and year, as a screen reader announces the month shown. */
  caption: (year: number, month: number) => string;
}>;

/** The {@link CalendarNames} of `locale` (a BCP 47 tag such as `'ja'`). */
export const calendarNames = (locale: string): CalendarNames => {
  const month = new Intl.DateTimeFormat(locale, { month: 'long' });

  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });

  const caption = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  });

  return {
    months: Array.from({ length: 12 }, (_, index) =>
      month.format(new Date(2000, index, 1, 12)),
    ),
    weekdaysShort: SUNDAY_TO_SATURDAY.map((date) => weekdayShort.format(date)),
    weekdaysLong: SUNDAY_TO_SATURDAY.map((date) => weekdayLong.format(date)),
    caption: (year, m) => caption.format(new Date(year, m - 1, 1, 12)),
  };
};

/** 2000-01-02 was a Sunday. */
const SUNDAY_TO_SATURDAY = Array.from(
  { length: 7 },
  (_, index) => new Date(2000, 0, 2 + index, 12),
);

if (import.meta.vitest !== undefined) {
  describe(calendarNames, () => {
    test('names the months and weekdays in Japanese', () => {
      const names = calendarNames('ja');

      assert.strictEqual(names.months[0], '1月');

      assert.strictEqual(names.months[11], '12月');

      assert.deepStrictEqual(names.weekdaysShort, [
        '日',
        '月',
        '火',
        '水',
        '木',
        '金',
        '土',
      ]);

      assert.strictEqual(names.weekdaysLong[0], '日曜日');

      assert.strictEqual(names.caption(2026, 10), '2026年10月');
    });

    test('names them in English', () => {
      const names = calendarNames('en-US');

      assert.strictEqual(names.months[9], 'October');

      assert.strictEqual(names.weekdaysShort[0], 'Sun');

      assert.strictEqual(names.weekdaysLong[6], 'Saturday');

      assert.strictEqual(names.caption(2026, 10), 'October 2026');
    });
  });
}
