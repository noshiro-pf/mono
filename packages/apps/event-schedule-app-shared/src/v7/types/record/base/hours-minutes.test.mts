import { expectType } from '@noshiro/ts-utils';
import {
  fillHoursMinutes,
  hoursMinutesDefaultValue,
  isHoursMinutes,
  type HoursMinutes,
} from './hours-minutes.mjs';

describe('HoursMinutes', () => {
  expectType<
    HoursMinutes,
    Readonly<{
      hours: HoursEnum;
      minutes: MinutesEnum;
    }>
  >('=');

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
