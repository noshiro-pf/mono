import * as t from 'ts-fortress';
import { DateUtils } from 'ts-fortress-types';
import { hoursTypeDef, minutesTypeDef } from '../../enum/index.mjs';

export const hoursMinutesTypeDef = t.record({
  hours: hoursTypeDef,
  minutes: minutesTypeDef,
});

export type HoursMinutes = t.TypeOf<typeof hoursMinutesTypeDef>;

export const hoursMinutesDefaultValue = hoursMinutesTypeDef.defaultValue;

export const isHoursMinutes = hoursMinutesTypeDef.is;

export const fillHoursMinutes = hoursMinutesTypeDef.fill;

export const hmFromDate = (date: Date): HoursMinutes =>
  ({
    hours: DateUtils.getLocaleHours(date),
    minutes: DateUtils.getLocaleMinutes(date),
  }) as const;

export const compareHm = (a: HoursMinutes, b: HoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return a.hours < b.hours ? -1 : 1;

  if (a.minutes !== b.minutes) return a.minutes < b.minutes ? -1 : 1;

  return 0;
};
