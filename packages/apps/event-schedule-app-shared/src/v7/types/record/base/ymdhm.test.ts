import { assertType } from '@noshiro/ts-utils';
import { hoursMinutesDefaultValue } from './hours-minutes';
import { yearMonthDateDefaultValue } from './year-month-date';
import type { Ymdhm } from './ymdhm';
import { fillYmdhm, isYmdhm, ymdhmDefaultValue } from './ymdhm';

describe('Ymdhm', () => {
  assertType<
    TypeEq<
      Ymdhm,
      Readonly<{
        year: YearEnum;
        month: MonthEnum;
        date: DateEnum;
        hours: HoursEnum;
        minutes: MinutesEnum;
      }>
    >
  >();

  test('defaultValue', () => {
    const defaultValue: Ymdhm = {
      year: yearMonthDateDefaultValue.year,
      month: yearMonthDateDefaultValue.month,
      date: yearMonthDateDefaultValue.date,
      hours: hoursMinutesDefaultValue.hours,
      minutes: hoursMinutesDefaultValue.minutes,
    };
    expect(ymdhmDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isYmdhm', () => {
    test('defaultValue should be true', () => {
      expect(isYmdhm(ymdhmDefaultValue)).toBe(true);
    });
  });

  describe('fillYmdhm', () => {
    test('defaultValue should be true', () => {
      expect(fillYmdhm({})).toStrictEqual(ymdhmDefaultValue);
    });
  });
});
