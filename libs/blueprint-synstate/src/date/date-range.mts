import { Optional } from 'ts-data-forge';
import {
  addMonths,
  compareDays,
  parseWallClock,
  type WallClock,
} from './wall-clock.mjs';

/**
 * The days from `minDate` to `maxDate`, each at 00:00, or Blueprint's
 * defaults for the one omitted or unreadable: 1 January 20 years before
 * `today`, and six months after it.
 */
export const dateRange = (
  today: WallClock,
  minDate: string | undefined,
  maxDate: string | undefined,
): Readonly<{ min: WallClock; max: WallClock }> => {
  const midnight = { hour: 0, minute: 0 } as const;

  const min = Optional.unwrapOr(parseWallClock(minDate ?? ''), {
    year: today.year - 20,
    month: 1,
    day: 1,
    ...midnight,
  });

  const max = Optional.unwrapOr(parseWallClock(maxDate ?? ''), {
    ...addMonths(today, 6),
    ...midnight,
  });

  return {
    min: { ...min, ...midnight },
    max:
      compareDays(max, min) < 0
        ? { ...min, ...midnight }
        : { ...max, ...midnight },
  };
};

if (import.meta.vitest !== undefined) {
  describe(dateRange, () => {
    const today = {
      year: 2026,
      month: 10,
      day: 23,
      hour: 14,
      minute: 5,
    } as const;

    test('defaults to Blueprint’s range', () => {
      assert.deepStrictEqual(dateRange(today, undefined, undefined), {
        min: { year: 2006, month: 1, day: 1, hour: 0, minute: 0 },
        max: { year: 2027, month: 4, day: 23, hour: 0, minute: 0 },
      });
    });

    test('reads the days given', () => {
      assert.deepStrictEqual(dateRange(today, '2020-02-03', '2030-12-31'), {
        min: { year: 2020, month: 2, day: 3, hour: 0, minute: 0 },
        max: { year: 2030, month: 12, day: 31, hour: 0, minute: 0 },
      });
    });
  });
}
