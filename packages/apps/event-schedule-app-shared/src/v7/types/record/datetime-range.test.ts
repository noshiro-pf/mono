import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
  type DatetimeRange,
} from './datetime-range';

import { assertType } from '@noshiro/ts-utils';
import { yearMonthDateDefaultValue, type YearMonthDate } from './base';
import { timeRangeDefaultValue, type TimeRange } from './time-range';

describe('DatetimeRange', () => {
  assertType<
    TypeEq<
      DatetimeRange,
      Readonly<{
        ymd: YearMonthDate;
        timeRange: TimeRange;
      }>
    >
  >();

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
