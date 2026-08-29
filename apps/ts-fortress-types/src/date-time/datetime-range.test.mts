import { expectType } from 'ts-data-forge';
import { DatetimeRange } from './datetime-range.mjs';
import { TimeRange } from './time-range.mjs';
import { YearMonthDate } from './year-month-date.mjs';

describe('DatetimeRange', () => {
  expectType<
    DatetimeRange,
    Readonly<{
      ymd: YearMonthDate;
      timeRange: TimeRange;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: DatetimeRange = {
      ymd: YearMonthDate.defaultValue,
      timeRange: TimeRange.defaultValue,
    } as const;

    assert.deepStrictEqual(DatetimeRange.defaultValue, defaultValue);
  });

  describe('isDatetimeRange', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(DatetimeRange.is(DatetimeRange.defaultValue));
    });
  });

  describe('fillDatetimeRange', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(
        DatetimeRange.fill({}),
        DatetimeRange.defaultValue,
      );
    });
  });
});
