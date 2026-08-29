import { expectType } from 'ts-data-forge';
import { type DateEnum, type MonthEnum, type SafeUint } from 'ts-type-forge';
import { toYears } from '../../enum/index.mjs';
import {
  fillYearMonthDate,
  isYearMonthDate,
  yearMonthDateDefaultValue,
  type YearMonthDate,
} from './year-month-date.mjs';

describe('YearMonthDate', () => {
  expectType<
    YearMonthDate,
    Readonly<{
      year: SafeUint;
      month: MonthEnum;
      date: DateEnum;
    }>
  >('=');

  test('defaultValue', () => {
    const defaultValue: YearMonthDate = {
      year: toYears(1900),
      month: 1,
      date: 1,
    } as const;

    assert.deepStrictEqual(yearMonthDateDefaultValue, defaultValue);
  });

  describe('isYearMonthDate', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(isYearMonthDate(yearMonthDateDefaultValue));
    });
  });

  describe('fillYearMonthDate', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(fillYearMonthDate({}), yearMonthDateDefaultValue);
    });
  });
});
