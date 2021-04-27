import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
  ReadonlyDate,
} from '@noshiro/ts-utils';
import {
  createIHoursMinutes,
  IHoursMinutes,
} from '../types/record/base/hours-minutes';
import {
  createIYearMonthDate,
  IYearMonthDate,
} from '../types/record/base/year-month-date';
import { createIYmdHm, IYmdHm } from '../types/record/ymd-hm';

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
