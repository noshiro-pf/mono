import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
} from './datetime-range.mjs';

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
