import { expectType } from 'ts-data-forge';
import {
  type DateEnum,
  type HoursEnum,
  type MinutesEnum,
  type MonthEnum,
  type SafeUint,
} from 'ts-type-forge';
import { HoursMinutes } from './hours-minutes.mjs';
import { YearMonthDate } from './year-month-date.mjs';
import { Ymdhm } from './ymdhm.mjs';

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
      year: YearMonthDate.defaultValue.year,
      month: YearMonthDate.defaultValue.month,
      date: YearMonthDate.defaultValue.date,
      hours: HoursMinutes.defaultValue.hours,
      minutes: HoursMinutes.defaultValue.minutes,
    } as const;

    assert.deepStrictEqual(Ymdhm.defaultValue, defaultValue);
  });

  describe('isYmdhm', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(Ymdhm.is(Ymdhm.defaultValue));
    });
  });

  describe('fillYmdhm', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(Ymdhm.fill({}), Ymdhm.defaultValue);
    });
  });
});
