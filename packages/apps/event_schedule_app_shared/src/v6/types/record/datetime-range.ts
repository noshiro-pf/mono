import { hasKey, hasKeyValue, isNonNullObject } from '@noshiro/ts-utils';
import type { YearMonthDate } from './base';
import {
  compareYmd,
  fillYearMonthDate,
  isYearMonthDate,
  yearMonthDateDefaultValue,
} from './base';
import type { TimeRange } from './time-range';
import {
  compareTimeRange,
  fillTimeRange,
  isTimeRange,
  timeRangeDefaultValue,
} from './time-range';

export type DatetimeRange = Readonly<{
  ymd: YearMonthDate;
  timeRange: TimeRange;
}>;

export const datetimeRangeDefaultValue: DatetimeRange = {
  ymd: yearMonthDateDefaultValue,
  timeRange: timeRangeDefaultValue,
} as const;

export const isDatetimeRange = (a: unknown): a is DatetimeRange =>
  isNonNullObject(a) &&
  hasKeyValue(a, 'ymd', isYearMonthDate) &&
  hasKeyValue(a, 'timeRange', isTimeRange);

const d = datetimeRangeDefaultValue;

export const fillDatetimeRange = (a?: unknown): DatetimeRange =>
  !isNonNullObject(a)
    ? d
    : {
        ymd: hasKey(a, 'ymd') ? fillYearMonthDate(a.ymd) : d.ymd,
        timeRange: hasKey(a, 'timeRange')
          ? fillTimeRange(a.timeRange)
          : d.timeRange,
      };

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