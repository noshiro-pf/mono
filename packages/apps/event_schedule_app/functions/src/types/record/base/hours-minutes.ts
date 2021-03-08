import { HoursEnum, MinutesEnum } from '@noshiro/ts-utils';
import { sign } from '../../../utils/sign';

export type HoursMinutesType = {
  hours: HoursEnum;
  minutes: MinutesEnum;
};

export const compareHm = (
  a: HoursMinutesType,
  b: HoursMinutesType
): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return sign(a.minutes - b.minutes);
  return 0;
};
