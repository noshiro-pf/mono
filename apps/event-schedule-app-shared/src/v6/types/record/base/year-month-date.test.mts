import {
  fillYearMonthDate,
  isDateEnum,
  isMonthEnum,
  isYearEnum,
  isYearMonthDate,
  yearMonthDateDefaultValue,
} from './year-month-date.mjs';

describe('isYearEnum', () => {
  test('true case', () => {
    assert.isTrue(isYearEnum(1970));
  });

  test('false case', () => {
    assert.isFalse(isYearEnum(-3));
  });
});

describe('isMonthEnum', () => {
  test('true case', () => {
    assert.isTrue(isMonthEnum(12));
  });

  test('false case', () => {
    assert.isFalse(isMonthEnum(13));
  });
});

describe('isDateEnum', () => {
  test('true case', () => {
    assert.isTrue(isDateEnum(31));
  });

  test('false case', () => {
    assert.isFalse(isDateEnum(32));
  });
});

describe('isYearMonthDate', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isYearMonthDate(yearMonthDateDefaultValue));
  });
});

describe('fillYearMonthDate', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillYearMonthDate({}), yearMonthDateDefaultValue);
  });
});
