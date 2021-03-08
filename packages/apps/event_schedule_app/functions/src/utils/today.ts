import {
  DateEnum,
  HoursEnum,
  MinutesEnum,
  MonthEnum,
  YearEnum,
} from '@noshiro/ts-utils';
import { YearMonthDateType } from '../types/record/base/year-month-date';
import { YmdHmJsType } from '../types/record/ymd-hm';

export const todayDate = (): Date => {
  const japanLocaleString = new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  });
  return new Date(japanLocaleString);
};

export const today = (): YearMonthDateType => {
  const nowDateObj = todayDate();
  return {
    year: nowDateObj.getFullYear() as YearEnum,
    month: (nowDateObj.getMonth() + 1) as MonthEnum,
    date: nowDateObj.getDate() as DateEnum,
  };
};

export const now = (): YmdHmJsType => {
  const nowDateObj = todayDate();
  return {
    ymd: today(),
    hm: {
      hours: nowDateObj.getHours() as HoursEnum,
      minutes: nowDateObj.getMinutes() as MinutesEnum,
    },
  };
};
