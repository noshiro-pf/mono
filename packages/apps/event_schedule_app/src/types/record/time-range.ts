import { IRecord } from '../../utils/immutable';
import type { IHoursMinutes, PartialHoursMinutes } from './base/hours-minutes';
import {
  compareHm,
  createIHoursMinutes,
  fillHoursMinutes,
} from './base/hours-minutes';

type TimeRangeBaseType = Readonly<{
  start: IHoursMinutes;
  end: IHoursMinutes;
}>;

export type PartialTimeRange = Partial<
  Readonly<{
    start: PartialHoursMinutes;
    end: PartialHoursMinutes;
  }>
>;

export type ITimeRange = IRecord<TimeRangeBaseType> &
  Readonly<TimeRangeBaseType>;

const ITimeRangeRecordFactory = IRecord<TimeRangeBaseType>({
  start: createIHoursMinutes(),
  end: createIHoursMinutes(),
});

export const createITimeRange: (a?: TimeRangeBaseType) => ITimeRange =
  ITimeRangeRecordFactory;

const d = ITimeRangeRecordFactory();
export const fillTimeRange = (p?: PartialTimeRange): ITimeRange =>
  createITimeRange({
    start: fillHoursMinutes(p?.start ?? d.start),
    end: fillHoursMinutes(p?.end ?? d.end),
  });

export const compareTimeRange = (a: ITimeRange, b: ITimeRange): number => {
  const compareStartHmResult = compareHm(a.start, b.start);
  if (compareStartHmResult !== 0) return compareStartHmResult;
  const compareEndHmResult = compareHm(a.end, b.end);
  if (compareEndHmResult !== 0) return compareEndHmResult;
  return 0;
};
