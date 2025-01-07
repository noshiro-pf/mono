import { expectType } from '@noshiro/ts-utils';
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
    };
    expect(DatetimeRange.defaultValue).toStrictEqual(defaultValue);
  });

  describe('isDatetimeRange', () => {
    test('defaultValue should be true', () => {
      expect(DatetimeRange.is(DatetimeRange.defaultValue)).toBe(true);
    });
  });

  describe('fillDatetimeRange', () => {
    test('defaultValue should be true', () => {
      expect(DatetimeRange.fill({})).toStrictEqual(DatetimeRange.defaultValue);
    });
  });
});
