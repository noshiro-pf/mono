import { expectType } from '@noshiro/ts-utils';
import {
  yearMonthDateDefaultValue,
  type YearMonthDate,
} from './base/index.mjs';
import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
  type DatetimeRange,
} from './datetime-range.mjs';
import { timeRangeDefaultValue, type TimeRange } from './time-range.mjs';

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
      ymd: yearMonthDateDefaultValue,
      timeRange: timeRangeDefaultValue,
    };
    expect(datetimeRangeDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isDatetimeRange', () => {
    test('defaultValue should be true', () => {
      expect(isDatetimeRange(datetimeRangeDefaultValue)).toBe(true);
    });
  });

  describe('fillDatetimeRange', () => {
    test('defaultValue should be true', () => {
      expect(fillDatetimeRange({})).toStrictEqual(datetimeRangeDefaultValue);
    });
  });
});
