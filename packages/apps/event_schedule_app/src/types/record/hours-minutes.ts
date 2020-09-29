import { HoursEnum, MinutesEnum, sign } from '@mono/ts-utils';
import { IRecord, IRecordType } from '../../utils/immutable';

export type HoursMinutesType = {
  hours: HoursEnum;
  minutes: MinutesEnum;
};

export const IHoursMinutes = IRecord<HoursMinutesType>({
  hours: 0,
  minutes: 0,
});

export type IHoursMinutesType = IRecordType<HoursMinutesType>;

export const compareHm = (
  a: IHoursMinutesType,
  b: IHoursMinutesType
): -1 | 0 | 1 => {
  if (a.hours !== b.hours) return sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return sign(a.minutes - b.minutes);
  return 0;
};
