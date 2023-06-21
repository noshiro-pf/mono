import { DateUtils, isNumber, isRecord, Num, Obj } from '@noshiro/ts-utils';

export type HoursMinutes = Readonly<{
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export const hoursMinutesDefaultValue = {
  hours: 0,
  minutes: 0,
} as const satisfies HoursMinutes;

export const isHoursEnum = (a: unknown): a is HoursEnum =>
  isNumber(a) && Number.isInteger(a) && Num.isInRangeInclusive(0, 23)(a);

export const isMinutesEnum = (a: unknown): a is MinutesEnum =>
  isNumber(a) && Number.isInteger(a) && Num.isInRangeInclusive(0, 59)(a);

export const isHoursMinutes = (a: unknown): a is HoursMinutes =>
  isRecord(a) &&
  Obj.hasKeyValue(a, 'hours', isHoursEnum) &&
  Obj.hasKeyValue(a, 'minutes', isMinutesEnum);

const d = hoursMinutesDefaultValue;

export const fillHoursMinutes = (a?: unknown): HoursMinutes =>
  a === undefined || !isRecord(a)
    ? d
    : {
        hours: Obj.hasKeyValue(a, 'hours', isHoursEnum) ? a.hours : d.hours,
        minutes: Obj.hasKeyValue(a, 'minutes', isMinutesEnum)
          ? a.minutes
          : d.minutes,
      };

export const hmFromDate = (date: DateUtils): HoursMinutes => ({
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
