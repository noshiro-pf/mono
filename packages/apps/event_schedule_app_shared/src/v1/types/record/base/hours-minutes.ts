import type { HoursEnum, MinutesEnum } from '@noshiro/ts-utils';
import { getHours, getMinutes, sign } from '@noshiro/ts-utils';

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

export const hmFromDate = (date: ReadonlyDate): HoursMinutes => ({
  hours: getHours(date),
  minutes: getMinutes(date),
});

export const compareHm = (a: HoursMinutes, b: HoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return sign(a.minutes - b.minutes);
  return 0;
};
