import * as t from '@noshiro/io-ts';
import { compareYmd, yearMonthDateTypeDef } from './base';
import { compareTimeRange, timeRangeTypeDef } from './time-range';

export const datetimeRangeTypeDef = t.record({
  ymd: yearMonthDateTypeDef,
  timeRange: timeRangeTypeDef,
});

export type DatetimeRange = t.Typeof<typeof datetimeRangeTypeDef>;

export const datetimeRangeDefaultValue = datetimeRangeTypeDef.defaultValue;

export const isDatetimeRange = datetimeRangeTypeDef.is;

export const fillDatetimeRange = datetimeRangeTypeDef.fill;

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
