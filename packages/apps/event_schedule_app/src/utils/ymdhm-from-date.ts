import type { ReadonlyDate } from '@noshiro/ts-utils';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@noshiro/ts-utils';
import type { IHoursMinutes } from '../types/record/base/hours-minutes';
import { createIHoursMinutes } from '../types/record/base/hours-minutes';
import type { IYearMonthDate } from '../types/record/base/year-month-date';
import { createIYearMonthDate } from '../types/record/base/year-month-date';
import type { IYmdHm } from '../types/record/ymd-hm';
import { createIYmdHm } from '../types/record/ymd-hm';

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
