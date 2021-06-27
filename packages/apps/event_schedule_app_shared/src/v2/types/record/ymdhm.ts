import type {
  DateEnum,
  HoursEnum,
  MinutesEnum,
  MonthEnum,
  ReadonlyDate,
  YearEnum,
} from '@noshiro/ts-utils';
import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
  newDate,
  sign,
} from '@noshiro/ts-utils';
import { defaultHoursMinutes, defaultYearMonthDate } from '../../../v1';

export type Ymdhm = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export type PartialYmdhm = Partial<Ymdhm>;

export const defaultYmdhm: Ymdhm = {
  year: defaultYearMonthDate.year,
  month: defaultYearMonthDate.month,
  date: defaultYearMonthDate.date,
  hours: defaultHoursMinutes.hours,
  minutes: defaultHoursMinutes.minutes,
};

const d = defaultYmdhm;
export const fillYmdhm = (p?: PartialYmdhm): Ymdhm => ({
  year: p?.year ?? d.year,
  month: p?.month ?? d.month,
  date: p?.date ?? d.date,
  hours: p?.hours ?? d.hours,
  minutes: p?.minutes ?? d.minutes,
});

export const ymdhmFromDate = (date: ReadonlyDate): Ymdhm => ({
  year: getYear(date),
  month: getMonth(date),
  date: getDate(date),
  hours: getHours(date),
  minutes: getMinutes(date),
});

export const ymdhm2Date = (ymdhm: Ymdhm): Date =>
  newDate(ymdhm.year, ymdhm.month, ymdhm.date, ymdhm.hours, ymdhm.minutes);

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year) return sign(a.year - b.year);
  if (a.month !== b.month) return sign(a.month - b.month);
  if (a.date !== b.date) return sign(a.date - b.date);
  if (a.hours !== b.hours) return sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return sign(a.minutes - b.minutes);
  return 0;
};
