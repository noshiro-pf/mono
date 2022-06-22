import type { TimeRange } from './time-range';
import {
  fillTimeRange,
  isTimeRange,
  timeRangeDefaultValue,
} from './time-range';

import { assertType } from '@noshiro/ts-utils';
import type { HoursMinutes } from './base';
import { hoursMinutesDefaultValue } from './base';

describe('TimeRange', () => {
  assertType<
    TypeEq<
      TimeRange,
      Readonly<{
        start: HoursMinutes;
        end: HoursMinutes;
      }>
    >
  >();

  test('defaultValue', () => {
    const defaultValue: TimeRange = {
      start: hoursMinutesDefaultValue,
      end: hoursMinutesDefaultValue,
    };
    expect(timeRangeDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isTimeRange', () => {
    test('defaultValue should be true', () => {
      expect(isTimeRange(timeRangeDefaultValue)).toBe(true);
    });
  });

  describe('fillTimeRange', () => {
    test('defaultValue should be true', () => {
      expect(fillTimeRange({})).toStrictEqual(timeRangeDefaultValue);
    });
  });
});
