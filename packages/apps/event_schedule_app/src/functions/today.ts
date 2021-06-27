import type { Ymdhm } from '@noshiro/event-schedule-app-shared';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from '@noshiro/ts-utils';

export const now = (): Ymdhm => {
  const nowDateObj = new Date();
  return {
    year: getYear(nowDateObj),
    month: getMonth(nowDateObj),
    date: getDate(nowDateObj),
    hours: getHours(nowDateObj),
    minutes: getMinutes(nowDateObj),
  };
};
