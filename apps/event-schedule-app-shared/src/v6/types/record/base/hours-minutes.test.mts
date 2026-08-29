import {
  fillHoursMinutes,
  hoursMinutesDefaultValue,
  isHoursEnum,
  isHoursMinutes,
  isMinutesEnum,
} from './hours-minutes.mjs';

describe('isHoursEnum', () => {
  test('true case', () => {
    assert.isTrue(isHoursEnum(0));
  });

  test('false case', () => {
    assert.isFalse(isHoursEnum(24));
  });
});

describe('isMinutesEnum', () => {
  test('true case', () => {
    assert.isTrue(isMinutesEnum(0));
  });

  test('false case', () => {
    assert.isFalse(isMinutesEnum(60));
  });
});

describe('isHoursMinutes', () => {
  test('defaultValue should be true', () => {
    assert.isTrue(isHoursMinutes(hoursMinutesDefaultValue));
  });
});

describe('fillHoursMinutes', () => {
  test('defaultValue should be true', () => {
    assert.deepStrictEqual(fillHoursMinutes({}), hoursMinutesDefaultValue);
  });
});
