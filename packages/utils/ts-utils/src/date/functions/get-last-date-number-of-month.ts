import { ReadonlyDate } from '../../types';
import { DateEnum, MonthEnum, YearEnum } from '../types';
import { getDate, getMonth, getYear } from './date-wrapper';
import { newDate } from './new-date';

/**
 * @description 引数の日が含まれる月の最終日(28-31)の数値を返す
 */
export const getLastDateNumberOfMonth = (
  year: YearEnum,
  month: MonthEnum
): DateEnum => getDate(newDate(year, (month + 1) as MonthEnum, 0 as DateEnum));

export const getLastDateNumberOfSameMonth = (date: ReadonlyDate): DateEnum =>
  getLastDateNumberOfMonth(getYear(date), getMonth(date));
