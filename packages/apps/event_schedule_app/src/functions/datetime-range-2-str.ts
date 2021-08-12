import type { DatetimeRange } from '@noshiro/event-schedule-app-shared';
import { timeRange2str } from './datetime-range-to-str';
import { ymd2str } from './ymdhm2str';

export const datetimeRange2Str = (datetimeRange: DatetimeRange): string =>
  `${ymd2str(datetimeRange.ymd)}--${timeRange2str(datetimeRange.timeRange)}`;
