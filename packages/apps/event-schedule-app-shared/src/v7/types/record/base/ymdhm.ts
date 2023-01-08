import * as t from '@noshiro/io-ts';
import { DateUtils, Num } from '@noshiro/ts-utils';
import {
  datesTypeDef,
  hoursTypeDef,
  minutesTypeDef,
  monthsTypeDef,
  yearsTypeDef,
} from '../../enum';

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

export const ymdhmFromDate = (date: RawDateType): Ymdhm => ({
  year: DateUtils.getLocaleYear(date),
  month: DateUtils.getLocaleMonth(date),
  date: DateUtils.getLocaleDate(date),
  hours: DateUtils.getLocaleHours(date),
  minutes: DateUtils.getLocaleMinutes(date),
});

export const ymdhm2Date = (ymdhm: Ymdhm): DateUtils =>
  DateUtils.create(
    ymdhm.year,
    ymdhm.month,
    ymdhm.date,
    ymdhm.hours,
    ymdhm.minutes
  );

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year) return Num.sign(a.year - b.year);
  if (a.month !== b.month) return Num.sign(a.month - b.month);
  if (a.date !== b.date) return Num.sign(a.date - b.date);
  if (a.hours !== b.hours) return Num.sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return Num.sign(a.minutes - b.minutes);
  return 0;
};
