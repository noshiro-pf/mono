import { assertType } from '@noshiro/ts-utils';
import type { HoursMinutes } from './hours-minutes';
import {
  fillHoursMinutes,
  hoursMinutesDefaultValue,
  isHoursMinutes,
} from './hours-minutes';

describe('HoursMinutes', () => {
  assertType<
    TypeEq<
      HoursMinutes,
      Readonly<{
        hours: HoursEnum;
        minutes: MinutesEnum;
      }>
    >
  >();

  test('defaultValue', () => {
    const defaultValue: HoursMinutes = {
      hours: 0,
      minutes: 0,
    };
    expect(hoursMinutesDefaultValue).toStrictEqual(defaultValue);
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
});
