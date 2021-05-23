import { IRecord } from '../../utils';
import type { IYearMonthDate, PartialYearMonthDate } from './base';
import { compareYmd, createIYearMonthDate, fillYearMonthDate } from './base';
import type { ITimeRange, PartialTimeRange } from './time-range';
import {
  compareTimeRange,
  createITimeRange,
  fillTimeRange,
} from './time-range';

type DatetimeRangeBaseType = Readonly<{
  ymd: IYearMonthDate;
  timeRange: ITimeRange;
}>;

export type PartialDatetimeRange = Partial<
  Readonly<{
    ymd: PartialYearMonthDate;
    timeRange: PartialTimeRange;
  }>
>;

export type IDatetimeRange = Readonly<
  DatetimeRangeBaseType & IRecord<DatetimeRangeBaseType>
>;

const IDatetimeRangeRecordFactory = IRecord<DatetimeRangeBaseType>({
  ymd: createIYearMonthDate(),
  timeRange: createITimeRange(),
});

export const createIDatetimeRange: (
  a?: DatetimeRangeBaseType
) => IDatetimeRange = IDatetimeRangeRecordFactory;

const d = IDatetimeRangeRecordFactory();
export const fillDatetimeRange = (p?: PartialDatetimeRange): IDatetimeRange =>
  createIDatetimeRange({
    ymd: fillYearMonthDate(p?.ymd ?? d.ymd),
    timeRange: fillTimeRange(p?.timeRange ?? d.timeRange),
  });

export const compareDatetimeRange = (
  a: IDatetimeRange,
  b: IDatetimeRange
): number => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareTimeRangeResult = compareTimeRange(a.timeRange, b.timeRange);
  if (compareTimeRangeResult !== 0) return compareTimeRangeResult;
  return 0;
};
