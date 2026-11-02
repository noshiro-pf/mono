import { dateRange, isDayInRange, parseWallClock } from 'blueprint-synstate';
import { Optional } from 'ts-data-forge';
import { dateFieldRange } from './date-field-range.mjs';

describe(dateFieldRange, () => {
  const today = {
    year: 2026,
    month: 10,
    day: 31,
    hour: 14,
    minute: 5,
  } as const;

  const inRange = (value: string): boolean => {
    const { minDate, maxDate } = dateFieldRange(today.year);

    const { min, max } = dateRange(today, minDate, maxDate);

    return isDayInRange(Optional.unwrapThrow(parseWallClock(value)), min, max);
  };

  test('runs from 2000 to 30 years after this year', () => {
    assert.deepStrictEqual(dateFieldRange(today.year), {
      minDate: '2000-01-01',
      maxDate: '2056-12-31',
    });
  });

  test('takes a date seven months ahead, which Blueprint’s default range leaves out', () => {
    const blueprint = dateRange(today, undefined, undefined);

    assert.isFalse(
      isDayInRange(
        Optional.unwrapThrow(parseWallClock('2027-06-01T09:00')),
        blueprint.min,
        blueprint.max,
      ),
    );

    assert.isTrue(inRange('2027-06-01T09:00'));

    assert.isTrue(inRange('2027-06-01'));
  });

  test('takes both ends', () => {
    assert.isTrue(inRange('2000-01-01'));

    assert.isTrue(inRange('2056-12-31T23:59'));

    assert.isFalse(inRange('1999-12-31'));

    assert.isFalse(inRange('2057-01-01'));
  });
});
