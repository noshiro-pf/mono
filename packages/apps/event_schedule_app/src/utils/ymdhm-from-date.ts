import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@mono/ts-utils';
import {
  createIHoursMinutes,
  IHoursMinutes,
} from '../types/record/base/hours-minutes';
import {
  createIYearMonthDate,
  IYearMonthDate,
} from '../types/record/base/year-month-date';
import { createIYmdHm, IYmdHm } from '../types/record/ymd-hm';

export const ymdFromDate = (date: Date): IYearMonthDate =>
  createIYearMonthDate({
    year: getYear(date),
    month: getMonth(date),
    date: getDate(date),
  });

export const hmFromDate = (date: Date): IHoursMinutes =>
  createIHoursMinutes({
    hours: getHours(date),
    minutes: getMinutes(date),
  });

export const ymdhmFromDate = (date: Date): IYmdHm =>
  createIYmdHm({
    ymd: ymdFromDate(date),
    hm: hmFromDate(date),
  });
