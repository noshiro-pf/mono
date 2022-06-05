import { IDate, IRecord, isNumber, isRecord, Num } from '@noshiro/ts-utils';

export type HoursMinutes = Readonly<{
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export const hoursMinutesDefaultValue: HoursMinutes = {
  hours: 0,
  minutes: 0,
} as const;

export const isHoursEnum = (a: unknown): a is HoursEnum =>
  isNumber(a) && Num.isInt(a) && Num.isInRange(0, 23)(a);

export const isMinutesEnum = (a: unknown): a is MinutesEnum =>
  isNumber(a) && Num.isInt(a) && Num.isInRange(0, 59)(a);

export const isHoursMinutes = (a: unknown): a is HoursMinutes =>
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'hours', isHoursEnum) &&
  IRecord.hasKeyValue(a, 'minutes', isMinutesEnum);

const d = hoursMinutesDefaultValue;

export const fillHoursMinutes = (a?: unknown): HoursMinutes =>
  a === undefined || !isRecord(a)
    ? d
    : {
        hours: IRecord.hasKeyValue(a, 'hours', isHoursEnum) ? a.hours : d.hours,
        minutes: IRecord.hasKeyValue(a, 'minutes', isMinutesEnum)
          ? a.minutes
          : d.minutes,
      };

export const hmFromDate = (date: IDate): HoursMinutes => ({
  hours: IDate.getLocaleHours(date),
  minutes: IDate.getLocaleMinutes(date),
});

export const compareHm = (a: HoursMinutes, b: HoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return Num.sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return Num.sign(a.minutes - b.minutes);
  return 0;
};
