import * as t from '@noshiro/io-ts';
import { DateUtils, Num, type DateType } from '@noshiro/ts-utils';
import { hoursTypeDef, minutesTypeDef } from '../../enum/index.mjs';

export const hoursMinutesTypeDef = t.record({
  hours: hoursTypeDef,
  minutes: minutesTypeDef,
});

export type HoursMinutes = t.TypeOf<typeof hoursMinutesTypeDef>;

export const hoursMinutesDefaultValue = hoursMinutesTypeDef.defaultValue;

export const isHoursMinutes = hoursMinutesTypeDef.is;

export const fillHoursMinutes = hoursMinutesTypeDef.fill;

export const hmFromDate = (date: DateType): HoursMinutes => ({
  hours: DateUtils.getLocaleHours(date),
  minutes: DateUtils.getLocaleMinutes(date),
});

export const compareHm = (a: HoursMinutes, b: HoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours)
    return Num.mapNaN2Undefined(Math.sign(a.hours - b.hours)) ?? 0;
  if (a.minutes !== b.minutes)
    return Num.mapNaN2Undefined(Math.sign(a.minutes - b.minutes)) ?? 0;
  return 0;
};
