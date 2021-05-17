import type { YearMonthDateType } from './base/year-month-date';
import type { TimeRangeJsType } from './time-range';

export type DatetimeRangeJsType = Readonly<{
  ymd: YearMonthDateType;
  timeRange: TimeRangeJsType;
}>;
