import { expectType } from '@noshiro/ts-utils';
import { HoursMinutes } from './hours-minutes.mjs';
import { YearMonthDate } from './year-month-date.mjs';
import { Ymdhm } from './ymdhm.mjs';

describe('Ymdhm', () => {
  expectType<
    Ymdhm,
    Readonly<{
      year: YearEnum;
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
    };
    expect(Ymdhm.defaultValue).toStrictEqual(defaultValue);
  });

  describe('isYmdhm', () => {
    test('defaultValue should be true', () => {
      expect(Ymdhm.is(Ymdhm.defaultValue)).toBe(true);
    });
  });

  describe('fillYmdhm', () => {
    test('defaultValue should be true', () => {
      expect(Ymdhm.fill({})).toStrictEqual(Ymdhm.defaultValue);
    });
  });
});
