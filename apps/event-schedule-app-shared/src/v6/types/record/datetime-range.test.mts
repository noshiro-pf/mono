import {
  datetimeRangeDefaultValue,
  fillDatetimeRange,
  isDatetimeRange,
} from './datetime-range.mjs';

describe('isDatetimeRange', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isDatetimeRange(datetimeRangeDefaultValue));
  });
});

describe('fillDatetimeRange', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillDatetimeRange({}), datetimeRangeDefaultValue);
  });
});
