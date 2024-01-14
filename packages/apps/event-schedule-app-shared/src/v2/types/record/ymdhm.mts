import { DateUtils, Num, type DateType } from '@noshiro/ts-utils';
import {
  defaultHoursMinutes,
  defaultYearMonthDate,
} from '../../../v1/index.mjs';

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

export const ymdhmFromDate = (date: RawDateType): Ymdhm => ({
  year: DateUtils.getLocaleYear(date),
  month: DateUtils.getLocaleMonth(date),
  date: DateUtils.getLocaleDate(date),
  hours: DateUtils.getLocaleHours(date),
  minutes: DateUtils.getLocaleMinutes(date),
});

export const ymdhm2Date = (ymdhm: Ymdhm): DateType =>
  DateUtils.create(
    ymdhm.year,
    ymdhm.month,
    ymdhm.date,
    ymdhm.hours,
    ymdhm.minutes,
  );

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year)
    return Num.mapNaN2Undefined(Math.sign(a.year - b.year)) ?? 0;
  if (a.month !== b.month)
    return Num.mapNaN2Undefined(Math.sign(a.month - b.month)) ?? 0;
  if (a.date !== b.date)
    return Num.mapNaN2Undefined(Math.sign(a.date - b.date)) ?? 0;
  if (a.hours !== b.hours)
    return Num.mapNaN2Undefined(Math.sign(a.hours - b.hours)) ?? 0;
  if (a.minutes !== b.minutes)
    return Num.mapNaN2Undefined(Math.sign(a.minutes - b.minutes)) ?? 0;
  return 0;
};
