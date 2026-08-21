import { DateUtils } from 'io-ts-types';
import {
  type DateEnum,
  type HoursEnum,
  type MinutesEnum,
  type MonthEnum,
  type SafeUint,
} from 'ts-type-forge';
import {
  defaultHoursMinutes,
  defaultYearMonthDate,
} from '../../../v1/index.mjs';

export type Ymdhm = Readonly<{
  year: SafeUint;
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
} as const;

const d = defaultYmdhm;

export const fillYmdhm = (p?: PartialYmdhm): Ymdhm =>
  ({
    year: p?.year ?? d.year,
    month: p?.month ?? d.month,
    date: p?.date ?? d.date,
    hours: p?.hours ?? d.hours,
    minutes: p?.minutes ?? d.minutes,
  }) as const;

export const ymdhmFromDate = (date: Date): Ymdhm =>
  ({
    year: DateUtils.getLocaleYear(date),
    month: DateUtils.getLocaleMonth(date),
    date: DateUtils.getLocaleDate(date),
    hours: DateUtils.getLocaleHours(date),
    minutes: DateUtils.getLocaleMinutes(date),
  }) as const;

export const ymdhm2Date = (ymdhm: Ymdhm): Date =>
  DateUtils.create(
    ymdhm.year,
    ymdhm.month,
    ymdhm.date,
    ymdhm.hours,
    ymdhm.minutes,
  );

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;

  if (a.month !== b.month) return a.month < b.month ? -1 : 1;

  if (a.date !== b.date) return a.date < b.date ? -1 : 1;

  if (a.hours !== b.hours) return a.hours < b.hours ? -1 : 1;

  if (a.minutes !== b.minutes) return a.minutes < b.minutes ? -1 : 1;

  return 0;
};
