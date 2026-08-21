import { expectType } from 'ts-data-forge';
import { type HoursEnum, type MinutesEnum } from 'ts-type-forge';
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
    } as const;

    assert.deepStrictEqual(HoursMinutes.defaultValue, defaultValue);
  });

  describe('isHoursMinutes', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(HoursMinutes.is(HoursMinutes.defaultValue));
    });
  });

  describe('fillHoursMinutes', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(HoursMinutes.fill({}), HoursMinutes.defaultValue);
    });
  });
});
