import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@noshiro/ts-utils';
import type { IYearMonthDate, IYmdHm } from '../types';
import {
  createIHoursMinutes,
  createIYearMonthDate,
  createIYmdHm,
} from '../types';

const today = (): IYearMonthDate => {
  const nowDateObj = new Date();
  return createIYearMonthDate({
    year: getYear(nowDateObj),
    month: getMonth(nowDateObj),
    date: getDate(nowDateObj),
  });
};

export const now = (): IYmdHm => {
  const nowDateObj = new Date();
  return createIYmdHm({
    ymd: today(),
    hm: createIHoursMinutes({
      hours: getHours(nowDateObj),
      minutes: getMinutes(nowDateObj),
    }),
  });
};
