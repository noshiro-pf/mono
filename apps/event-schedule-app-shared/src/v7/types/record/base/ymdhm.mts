import { DateUtils } from 'io-ts-types';
import * as t from 'ts-fortress';
import {
  datesTypeDef,
  hoursTypeDef,
  minutesTypeDef,
  monthsTypeDef,
  yearsTypeDef,
} from '../../enum/index.mjs';

export const ymdhmTypeDef = t.record({
  year: yearsTypeDef,
  month: monthsTypeDef,
  date: datesTypeDef,
  hours: hoursTypeDef,
  minutes: minutesTypeDef,
});

export type Ymdhm = t.TypeOf<typeof ymdhmTypeDef>;

export const ymdhmDefaultValue = ymdhmTypeDef.defaultValue;

export const isYmdhm = ymdhmTypeDef.is;

export const fillYmdhm = ymdhmTypeDef.fill;

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
