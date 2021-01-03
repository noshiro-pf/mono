import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@mono/ts-utils';
import { createIHoursMinutes } from '../types/record/base/hours-minutes';
import {
  createIYearMonthDate,
  IYearMonthDate,
} from '../types/record/base/year-month-date';
import { createIYmdHm, IYmdHm } from '../types/record/ymd-hm';

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
