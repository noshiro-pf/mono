import type {
  DatetimeRange,
  TimeRange,
} from '@noshiro/event-schedule-app-shared';
import { texts } from '../constants';
import { hm2str, ymd2str } from './ymdhm2str';

const vt = texts.date;

export const timeRange2str = (timeRange: TimeRange): string =>
  `${hm2str(timeRange.start)}${vt.timeRangeTilde}${hm2str(timeRange.end)}`;

export const datetimeRange2str = (datetimeRange: DatetimeRange): string =>
  `${ymd2str(datetimeRange.ymd)}--${timeRange2str(datetimeRange.timeRange)}`;
