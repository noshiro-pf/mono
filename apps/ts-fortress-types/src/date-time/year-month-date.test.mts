import { expectType } from 'ts-data-forge';
import { type DateEnum, type MonthEnum, type SafeUint } from 'ts-type-forge';
import { Years } from './time-enum.mjs';
import { YearMonthDate } from './year-month-date.mjs';

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
      year: Years.fill(1900),
      month: 1,
      date: 1,
    } as const;

    assert.deepStrictEqual(YearMonthDate.defaultValue, defaultValue);
  });

  describe('isYearMonthDate', () => {
    test('defaultValue should be true', () => {
      assert.isTrue(YearMonthDate.is(YearMonthDate.defaultValue));
    });
  });

  describe('fillYearMonthDate', () => {
    test('defaultValue should be true', () => {
      assert.deepStrictEqual(
        YearMonthDate.fill({}),
        YearMonthDate.defaultValue,
      );
    });
  });
});
