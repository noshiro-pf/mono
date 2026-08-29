import { Num, isNumber, isRecord } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { type HoursEnum, type MinutesEnum } from 'ts-type-forge';
import { hasKeyValue } from '../../../../utils/index.mjs';

export type HoursMinutes = Readonly<{
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export const hoursMinutesDefaultValue = {
  hours: 0,
  minutes: 0,
} as const satisfies HoursMinutes;

export const isHoursEnum = (a: unknown): a is HoursEnum =>
  isNumber(a) && Number.isSafeInteger(a) && Num.isInRangeInclusive(0, 23)(a);

export const isMinutesEnum = (a: unknown): a is MinutesEnum =>
  isNumber(a) && Number.isSafeInteger(a) && Num.isInRangeInclusive(0, 59)(a);

export const isHoursMinutes = (a: unknown): a is HoursMinutes =>
  isRecord(a) &&
  hasKeyValue(a, 'hours', isHoursEnum) &&
  hasKeyValue(a, 'minutes', isMinutesEnum);

const d = hoursMinutesDefaultValue;

export const fillHoursMinutes = (a?: unknown): HoursMinutes =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        hours: hasKeyValue(a, 'hours', isHoursEnum) ? a.hours : d.hours,
        minutes: hasKeyValue(a, 'minutes', isMinutesEnum)
          ? a.minutes
          : d.minutes,
      } as const);

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
