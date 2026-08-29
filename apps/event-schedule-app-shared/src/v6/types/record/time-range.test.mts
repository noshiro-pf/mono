import {
  fillTimeRange,
  isTimeRange,
  timeRangeDefaultValue,
} from './time-range.mjs';

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
