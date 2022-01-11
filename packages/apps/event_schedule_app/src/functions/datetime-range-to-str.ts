import type {
  DatetimeRange,
  TimeRange,
} from '@noshiro/event-schedule-app-shared';
import { dict } from '../constants';
import { hm2str, ymd2str } from './ymdhm2str';

const dc = dict.common.date;

export const timeRange2str = (timeRange: TimeRange): string =>
  `${hm2str(timeRange.start)}${dc.timeRangeTilde}${hm2str(timeRange.end)}`;

export const datetimeRange2str = (datetimeRange: DatetimeRange): string =>
  `${ymd2str(datetimeRange.ymd)}--${timeRange2str(datetimeRange.timeRange)}`;
