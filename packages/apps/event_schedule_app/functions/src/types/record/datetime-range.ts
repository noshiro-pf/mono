import { YearMonthDateType } from './base/year-month-date';
import { TimeRangeJsType } from './time-range';

export type DatetimeRangeJsType = Readonly<{
  ymd: YearMonthDateType;
  timeRange: TimeRangeJsType;
}>;
