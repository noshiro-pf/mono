import { expectType } from 'ts-data-forge';
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
    } as const;

    assert.deepStrictEqual(timeRangeDefaultValue, defaultValue);
  });

  describe('isTimeRange', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(isTimeRange(timeRangeDefaultValue));
    });
  });

  describe('fillTimeRange', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(fillTimeRange({}), timeRangeDefaultValue);
    });
  });
});
