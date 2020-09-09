import { IRecord, IRecordType } from '../../utils/immutable';
import { compareHm, IHoursMinutes, IHoursMinutesType } from './hours-minutes';

export type TimeRangeType = {
  start: IHoursMinutesType;
  end: IHoursMinutesType;
};

export const ITimeRange = IRecord<TimeRangeType>({
  start: IHoursMinutes(),
  end: IHoursMinutes(),
});

export type ITimeRangeType = IRecordType<TimeRangeType>;

export const compareTimeRange = (
  a: ITimeRangeType,
  b: ITimeRangeType
): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
