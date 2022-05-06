import {
  fillHoursMinutes,
  hoursMinutesDefaultValue,
  isHoursEnum,
  isHoursMinutes,
  isMinutesEnum,
} from './hours-minutes';

describe('isHoursEnum', () => {
  test('true case', () => {
    expect(isHoursEnum(0)).toBe(true);
  });
  test('false case', () => {
    expect(isHoursEnum(24)).toBe(false);
  });
});

describe('isMinutesEnum', () => {
  test('true case', () => {
    expect(isMinutesEnum(0)).toBe(true);
  });
  test('false case', () => {
    expect(isMinutesEnum(60)).toBe(false);
  });
});

describe('isHoursMinutes', () => {
  test('defaultValue should be true', () => {
    expect(isHoursMinutes(hoursMinutesDefaultValue)).toBe(true);
  });
});

describe('fillHoursMinutes', () => {
  test('defaultValue should be true', () => {
    expect(fillHoursMinutes({})).toStrictEqual(hoursMinutesDefaultValue);
  });
});
