import type { MakeTuple } from 'ts-type-forge';
import { localNoon } from '../internal/index.mjs';

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

/**
 * The {@link CalendarNames} of `locale` (a BCP 47 tag such as `'ja'`), the heads
 * of the grid being `weekdayNames` where given.
 */
export const calendarNames = (
  locale: string,
  weekdayNames?: WeekdayNames,
): CalendarNames => {
  const month = new Intl.DateTimeFormat(locale, { month: 'long' });

  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });

  const caption = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
  });

  return {
    months: Array.from({ length: 12 }, (_, index) =>
      month.format(localNoon(2000, index + 1, 1)),
    ),
    // Seven names, as the type says: a list cast to it is drawn as it is.
    weekdaysShort: weekdayNames ?? shortWeekdays(locale),
    weekdaysLong: SUNDAY_TO_SATURDAY.map((date) => weekdayLong.format(date)),
    caption: (year, m) => caption.format(localNoon(year, m, 1)),
  };
};

/**
 * The seven names a picker heads its weekday columns with, Sunday first, in
 * place of `Intl`'s short names in its `locale` (`Sun`). Blueprint draws
 * date-fns's two-letter short names (`Su`), which `Intl` has no format for:
 * pass those to draw them. The full names read out stay `Intl`'s.
 */
export type WeekdayNames = MakeTuple<7, string>;

const shortWeekdays = (locale: string): readonly string[] => {
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });

  return SUNDAY_TO_SATURDAY.map((date) => weekdayShort.format(date));
};

/** 2000-01-02 was a Sunday. */
const SUNDAY_TO_SATURDAY = Array.from({ length: 7 }, (_, index) =>
  localNoon(2000, 1, 2 + index),
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

    test('heads the weekdays with the names given, keeping the full ones', () => {
      const names = calendarNames('ja', ['S', 'M', 'T', 'W', 'T', 'F', 'S']);

      assert.deepStrictEqual(names.weekdaysShort, [
        'S',
        'M',
        'T',
        'W',
        'T',
        'F',
        'S',
      ]);

      assert.strictEqual(names.weekdaysLong[0], '日曜日');

      assert.strictEqual(names.months[0], '1月');
    });
  });
}
