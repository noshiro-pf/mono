import { HoursEnum, MinutesEnum, sign } from '@noshiro/ts-utils';
import { IRecord } from '../../../utils/immutable';

type HoursMinutesBaseType = Readonly<{
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export type PartialHoursMinutes = Partial<Readonly<HoursMinutesBaseType>>;

export type IHoursMinutes = IRecord<HoursMinutesBaseType> &
  Readonly<HoursMinutesBaseType>;

const IHoursMinutesRecordFactory = IRecord<HoursMinutesBaseType>({
  hours: 0,
  minutes: 0,
});

export const createIHoursMinutes: (
  a?: HoursMinutesBaseType
) => IHoursMinutes = IHoursMinutesRecordFactory;

export const fillHoursMinutes: (
  a?: PartialHoursMinutes
) => IHoursMinutes = IHoursMinutesRecordFactory;

export const compareHm = (a: IHoursMinutes, b: IHoursMinutes): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return sign(a.minutes - b.minutes);
  return 0;
};
