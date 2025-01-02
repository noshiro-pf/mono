import { expectType } from '@noshiro/ts-utils';
import { Years } from './time-enum.mjs';
import { YearMonthDate } from './year-month-date.mjs';

describe('YearMonthDate', () => {
  expectType<
    YearMonthDate,
    Readonly<{
      year: YearEnum;
      month: MonthEnum;
      date: DateEnum;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: YearMonthDate = {
      year: Years.fill(1900),
      month: 1,
      date: 1,
    };
    expect(YearMonthDate.defaultValue).toStrictEqual(defaultValue);
  });

  describe('isYearMonthDate', () => {
    test('defaultValue should be true', () => {
      expect(YearMonthDate.is(YearMonthDate.defaultValue)).toBe(true);
    });
  });

  describe('fillYearMonthDate', () => {
    test('defaultValue should be true', () => {
      expect(YearMonthDate.fill({})).toStrictEqual(YearMonthDate.defaultValue);
    });
  });
});
