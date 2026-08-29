import { DateUtils } from 'ts-fortress-types';
import { type HoursEnum, type MinutesEnum } from 'ts-type-forge';

export type HoursMinutes = Readonly<{
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export type PartialHoursMinutes = Partial<HoursMinutes>;

export const defaultHoursMinutes = {
  hours: 0,
  minutes: 0,
} as const satisfies HoursMinutes;

const d = defaultHoursMinutes;

export const fillHoursMinutes = (a?: PartialHoursMinutes): HoursMinutes =>
  ({
    hours: a?.hours ?? d.hours,
    minutes: a?.minutes ?? d.minutes,
  }) as const;

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
