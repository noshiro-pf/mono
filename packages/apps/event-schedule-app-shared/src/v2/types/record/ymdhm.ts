import { IDate, Num } from '@noshiro/ts-utils';
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

export const ymdhmFromDate = (date: RawDateType): Ymdhm => ({
  year: IDate.getLocaleYear(date),
  month: IDate.getLocaleMonth(date),
  date: IDate.getLocaleDate(date),
  hours: IDate.getLocaleHours(date),
  minutes: IDate.getLocaleMinutes(date),
});

export const ymdhm2Date = (ymdhm: Ymdhm): IDate =>
  IDate.create(ymdhm.year, ymdhm.month, ymdhm.date, ymdhm.hours, ymdhm.minutes);

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year) return Num.sign(a.year - b.year);
  if (a.month !== b.month) return Num.sign(a.month - b.month);
  if (a.date !== b.date) return Num.sign(a.date - b.date);
  if (a.hours !== b.hours) return Num.sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return Num.sign(a.minutes - b.minutes);
  return 0;
};