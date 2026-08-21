import { expectType } from 'ts-data-forge';
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
    } as const;

    assert.deepStrictEqual(TimeRange.defaultValue, defaultValue);
  });

  describe('isTimeRange', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(TimeRange.is(TimeRange.defaultValue));
    });
  });

  describe('fillTimeRange', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(TimeRange.fill({}), TimeRange.defaultValue);
    });
  });
});
