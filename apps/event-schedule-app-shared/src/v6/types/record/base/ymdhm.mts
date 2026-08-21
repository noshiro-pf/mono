import { DateUtils } from 'io-ts-types';
import { isRecord } from 'ts-data-forge';
import {
  type DateEnum,
  type HoursEnum,
  type MinutesEnum,
  type MonthEnum,
  type SafeUint,
} from 'ts-type-forge';
import { hasKeyValue } from '../../../../utils/index.mjs';
import {
  hoursMinutesDefaultValue,
  isHoursEnum,
  isMinutesEnum,
} from './hours-minutes.mjs';
import {
  isDateEnum,
  isMonthEnum,
  isYearEnum,
  yearMonthDateDefaultValue,
} from './year-month-date.mjs';

export type Ymdhm = Readonly<{
  year: SafeUint;
  month: MonthEnum;
  date: DateEnum;
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export const ymdhmDefaultValue: Ymdhm = {
  year: yearMonthDateDefaultValue.year,
  month: yearMonthDateDefaultValue.month,
  date: yearMonthDateDefaultValue.date,
  hours: hoursMinutesDefaultValue.hours,
  minutes: hoursMinutesDefaultValue.minutes,
} as const;

export const isYmdhm = (a: unknown): a is Ymdhm =>
  isRecord(a) &&
  hasKeyValue(a, 'year', isYearEnum) &&
  hasKeyValue(a, 'month', isMonthEnum) &&
  hasKeyValue(a, 'date', isDateEnum) &&
  hasKeyValue(a, 'hours', isHoursEnum) &&
  hasKeyValue(a, 'minutes', isMinutesEnum);

const d = ymdhmDefaultValue;

export const fillYmdhm = (a?: unknown): Ymdhm =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        year: hasKeyValue(a, 'year', isYearEnum) ? a.year : d.year,
        month: hasKeyValue(a, 'month', isMonthEnum) ? a.month : d.month,
        date: hasKeyValue(a, 'date', isDateEnum) ? a.date : d.date,
        hours: hasKeyValue(a, 'hours', isHoursEnum) ? a.hours : d.hours,
        minutes: hasKeyValue(a, 'minutes', isMinutesEnum)
          ? a.minutes
          : d.minutes,
      } as const);

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
