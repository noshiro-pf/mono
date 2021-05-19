import type { YearMonthDateType } from './base';
import type { TimeRangeJsType } from './time-range';

export type DatetimeRangeJsType = Readonly<{
  ymd: YearMonthDateType;
  timeRange: TimeRangeJsType;
}>;
