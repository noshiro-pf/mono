import { hasKey, isRecord } from 'ts-data-forge';
import { hasKeyValue } from '../../../utils/index.mjs';
import {
  compareYmd,
  fillYearMonthDate,
  isYearMonthDate,
  yearMonthDateDefaultValue,
  type YearMonthDate,
} from './base/index.mjs';
import {
  compareTimeRange,
  fillTimeRange,
  isTimeRange,
  timeRangeDefaultValue,
  type TimeRange,
} from './time-range.mjs';

export type DatetimeRange = Readonly<{
  ymd: YearMonthDate;
  timeRange: TimeRange;
}>;

export const datetimeRangeDefaultValue = {
  ymd: yearMonthDateDefaultValue,
  timeRange: timeRangeDefaultValue,
} as const satisfies DatetimeRange;

export const isDatetimeRange = (a: unknown): a is DatetimeRange =>
  isRecord(a) &&
  hasKeyValue(a, 'ymd', isYearMonthDate) &&
  hasKeyValue(a, 'timeRange', isTimeRange);

const d = datetimeRangeDefaultValue;

export const fillDatetimeRange = (a?: unknown): DatetimeRange =>
  a === undefined || !isRecord(a)
    ? d
    : ({
        ymd: hasKey(a, 'ymd') ? fillYearMonthDate(a.ymd) : d.ymd,
        timeRange: hasKey(a, 'timeRange')
          ? fillTimeRange(a.timeRange)
          : d.timeRange,
      } as const);

export const compareDatetimeRange = (
  a: DatetimeRange,
  b: DatetimeRange,
): number => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);

  if (compareYmdResult !== 0) return compareYmdResult;

  const compareTimeRangeResult = compareTimeRange(a.timeRange, b.timeRange);

  if (compareTimeRangeResult !== 0) return compareTimeRangeResult;

  return 0;
};
