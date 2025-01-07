import { expectType } from '@noshiro/ts-utils';
import { HoursMinutes } from './hours-minutes.mjs';
import { TimeRange } from './time-range.mjs';

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
      start: HoursMinutes.defaultValue,
      end: HoursMinutes.defaultValue,
    };
    expect(TimeRange.defaultValue).toStrictEqual(defaultValue);
  });

  describe('isTimeRange', () => {
    test('defaultValue should be true', () => {
      expect(TimeRange.is(TimeRange.defaultValue)).toBe(true);
    });
  });

  describe('fillTimeRange', () => {
    test('defaultValue should be true', () => {
      expect(TimeRange.fill({})).toStrictEqual(TimeRange.defaultValue);
    });
  });
});
