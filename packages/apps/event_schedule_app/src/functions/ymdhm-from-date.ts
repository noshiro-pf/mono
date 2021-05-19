import type { ReadonlyDate } from '@noshiro/ts-utils';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@noshiro/ts-utils';
import type { IHoursMinutes, IYearMonthDate, IYmdHm } from '../types';
import {
  createIHoursMinutes,
  createIYearMonthDate,
  createIYmdHm,
} from '../types';

export const ymdFromDate = (date: ReadonlyDate): IYearMonthDate =>
  createIYearMonthDate({
    year: getYear(date),
    month: getMonth(date),
    date: getDate(date),
  });

export const hmFromDate = (date: ReadonlyDate): IHoursMinutes =>
  createIHoursMinutes({
    hours: getHours(date),
    minutes: getMinutes(date),
  });

export const ymdhmFromDate = (date: ReadonlyDate): IYmdHm =>
  createIYmdHm({
    ymd: ymdFromDate(date),
    hm: hmFromDate(date),
  });
