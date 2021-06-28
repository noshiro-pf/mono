import type { PartialYearMonthDate, YearMonthDate } from './base';
import { compareYmd, defaultYearMonthDate, fillYearMonthDate } from './base';
import type { PartialTimeRange, TimeRange } from './time-range';
import {
  compareTimeRange,
  defaultTimeRange,
  fillTimeRange,
} from './time-range';

export type DatetimeRange = Readonly<{
  ymd: YearMonthDate;
  timeRange: TimeRange;
}>;

export type PartialDatetimeRange = Partial<
  Readonly<{
    ymd: PartialYearMonthDate;
    timeRange: PartialTimeRange;
  }>
>;

export const defaultDatetimeRange: DatetimeRange = {
  ymd: defaultYearMonthDate,
  timeRange: defaultTimeRange,
} as const;

const d = defaultDatetimeRange;
export const fillDatetimeRange = (p?: PartialDatetimeRange): DatetimeRange => ({
  ymd: fillYearMonthDate(p?.ymd ?? d.ymd),
  timeRange: fillTimeRange(p?.timeRange ?? d.timeRange),
});

export const compareDatetimeRange = (
  a: DatetimeRange,
  b: DatetimeRange
): number => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareTimeRangeResult = compareTimeRange(a.timeRange, b.timeRange);
  if (compareTimeRangeResult !== 0) return compareTimeRangeResult;
  return 0;
};
