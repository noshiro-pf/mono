import { expectType } from 'ts-data-forge';
import {
  type DateEnum,
  type HoursEnum,
  type MinutesEnum,
  type MonthEnum,
  type SafeUint,
} from 'ts-type-forge';
import { hoursMinutesDefaultValue } from './hours-minutes.mjs';
import { yearMonthDateDefaultValue } from './year-month-date.mjs';
import { fillYmdhm, isYmdhm, ymdhmDefaultValue, type Ymdhm } from './ymdhm.mjs';

describe('Ymdhm', () => {
  expectType<
    Ymdhm,
    Readonly<{
      year: SafeUint;
      month: MonthEnum;
      date: DateEnum;
      hours: HoursEnum;
      minutes: MinutesEnum;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: Ymdhm = {
      year: yearMonthDateDefaultValue.year,
      month: yearMonthDateDefaultValue.month,
      date: yearMonthDateDefaultValue.date,
      hours: hoursMinutesDefaultValue.hours,
      minutes: hoursMinutesDefaultValue.minutes,
    } as const;

    assert.deepStrictEqual(ymdhmDefaultValue, defaultValue);
  });

  describe('isYmdhm', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(isYmdhm(ymdhmDefaultValue));
    });
  });

  describe('fillYmdhm', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(fillYmdhm({}), ymdhmDefaultValue);
    });
  });
});
