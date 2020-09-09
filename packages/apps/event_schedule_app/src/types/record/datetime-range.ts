import { IRecord, IRecordType } from '../../utils/immutable';
import { compareTimeRange, ITimeRange, ITimeRangeType } from './time-range';
import {
  compareYmd,
  IYearMonthDate,
  IYearMonthDateType,
} from './year-month-date';

type DatetimeRangeType = {
  ymd: IYearMonthDateType;
  timeRange: ITimeRangeType;
};

export const IDatetimeRange = IRecord<DatetimeRangeType>({
  ymd: IYearMonthDate(),
  timeRange: ITimeRange(),
});

export type IDatetimeRangeType = IRecordType<DatetimeRangeType>;

export const compareDatetimeRange = (
  a: IDatetimeRangeType,
  b: IDatetimeRangeType
): number => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareTimeRangeResult = compareTimeRange(a.timeRange, b.timeRange);
  if (compareTimeRangeResult !== 0) return compareTimeRangeResult;
  return 0;
};
