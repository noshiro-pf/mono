import * as t from '@noshiro/io-ts';
import { compareTimeRange, TimeRange } from './time-range.mjs';
import { compareYearMonthDate, YearMonthDate } from './year-month-date.mjs';

export const DatetimeRange = t.record({
  ymd: YearMonthDate,
  timeRange: TimeRange,
});

export type DatetimeRange = t.TypeOf<typeof DatetimeRange>;

export const compareDatetimeRange = (
  a: DatetimeRange,
  b: DatetimeRange,
): number => {
  const compareYmdResult = compareYearMonthDate(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareTimeRangeResult = compareTimeRange(a.timeRange, b.timeRange);
  if (compareTimeRangeResult !== 0) return compareTimeRangeResult;
  return 0;
};
