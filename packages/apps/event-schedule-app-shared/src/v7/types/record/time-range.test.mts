import { expectType } from '@noshiro/ts-utils';
import { describe, expect, test } from 'vitest';
import { hoursMinutesDefaultValue, type HoursMinutes } from './base/index.mjs';
import {
  fillTimeRange,
  isTimeRange,
  timeRangeDefaultValue,
  type TimeRange,
} from './time-range.mjs';

describe('TimeRange', () => {
  expectType<
    TimeRange,
    Readonly<{
      start: HoursMinutes;
      end: HoursMinutes;
    }>
  >('=');

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
