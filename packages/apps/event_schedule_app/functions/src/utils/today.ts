import type { YearMonthDate, Ymdhm } from '@noshiro/event-schedule-app-api';
import type {
  DateEnum,
  HoursEnum,
  MinutesEnum,
  MonthEnum,
  YearEnum,
} from '@noshiro/ts-utils';

export const todayDate = (): Date => {
  const japanLocaleString = new Date().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  });
  return new Date(japanLocaleString);
};

export const today = (): YearMonthDate => {
  const nowDateObj = todayDate();
  return {
    year: nowDateObj.getFullYear() as YearEnum,
    month: (nowDateObj.getMonth() + 1) as MonthEnum,
    date: nowDateObj.getDate() as DateEnum,
  };
};

export const now = (): Ymdhm => {
  const nowDateObj = todayDate();
  return {
    year: nowDateObj.getFullYear() as YearEnum,
    month: (nowDateObj.getMonth() + 1) as MonthEnum,
    date: nowDateObj.getDate() as DateEnum,
    hours: nowDateObj.getHours() as HoursEnum,
    minutes: nowDateObj.getMinutes() as MinutesEnum,
  };
};
