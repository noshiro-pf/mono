import { expectType } from '@noshiro/ts-utils';
import { toYears } from '../../enum';
import {
  fillYearMonthDate,
  isYearMonthDate,
  yearMonthDateDefaultValue,
  type YearMonthDate,
} from './year-month-date';

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
      year: toYears(1900),
      month: 1,
      date: 1,
    };
    expect(yearMonthDateDefaultValue).toStrictEqual(defaultValue);
  });

  describe('isYearMonthDate', () => {
    test('defaultValue should be true', () => {
      expect(isYearMonthDate(yearMonthDateDefaultValue)).toBe(true);
    });
  });

  describe('fillYearMonthDate', () => {
    test('defaultValue should be true', () => {
      expect(fillYearMonthDate({})).toStrictEqual(yearMonthDateDefaultValue);
    });
  });
});
