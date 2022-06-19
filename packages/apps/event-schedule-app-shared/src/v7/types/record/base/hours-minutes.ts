import * as t from '@noshiro/io-ts';
import { IDate, Num } from '@noshiro/ts-utils';
import { hoursTypeDef, minutesTypeDef } from '../../enum';

export const hoursMinutesTypeDef = t.record({
  hours: hoursTypeDef,
  minutes: minutesTypeDef,
});

export type HoursMinutes = t.Typeof<typeof hoursMinutesTypeDef>;

export const hoursMinutesDefaultValue = hoursMinutesTypeDef.defaultValue;

export const isHoursMinutes = hoursMinutesTypeDef.is;

export const fillHoursMinutes = hoursMinutesTypeDef.fill;

export const hmFromDate = (date: IDate): HoursMinutes => ({
  hours: IDate.getLocaleHours(date),
  minutes: IDate.getLocaleMinutes(date),
});

export const compareHm = (a: HoursMinutes, b: HoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return Num.sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return Num.sign(a.minutes - b.minutes);
  return 0;
};
