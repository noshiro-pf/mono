import { DateUtils, Num } from '@noshiro/ts-utils';

export type HoursMinutes = Readonly<{
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export type PartialHoursMinutes = Partial<HoursMinutes>;

export const defaultHoursMinutes: HoursMinutes = {
  hours: 0,
  minutes: 0,
} as const;

const d = defaultHoursMinutes;
export const fillHoursMinutes = (a?: PartialHoursMinutes): HoursMinutes => ({
  hours: a?.hours ?? d.hours,
  minutes: a?.minutes ?? d.minutes,
});

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
