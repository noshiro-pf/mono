import {
  fillTimeRange,
  isTimeRange,
  timeRangeDefaultValue,
} from './time-range';

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
