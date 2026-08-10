import { expectType } from '@noshiro/ts-utils';
import { HoursMinutes } from './hours-minutes.mjs';

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
    expect(HoursMinutes.defaultValue).toStrictEqual(defaultValue);
  });

  describe('isHoursMinutes', () => {
    test('defaultValue should be true', () => {
      expect(HoursMinutes.is(HoursMinutes.defaultValue)).toBe(true);
    });
  });

  describe('fillHoursMinutes', () => {
    test('defaultValue should be true', () => {
      expect(HoursMinutes.fill({})).toStrictEqual(HoursMinutes.defaultValue);
    });
  });
});
