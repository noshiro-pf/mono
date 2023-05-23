import {
  compareYmd,
  defaultYearMonthDate,
  fillYearMonthDate,
  type PartialYearMonthDate,
  type YearMonthDate,
} from './base';
import {
  compareTimeRange,
  defaultTimeRange,
  fillTimeRange,
  type PartialTimeRange,
  type TimeRange,
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

export const defaultDatetimeRange = {
  ymd: defaultYearMonthDate,
  timeRange: defaultTimeRange,
} as const satisfies DatetimeRange;

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
