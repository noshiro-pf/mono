import { texts } from '../constants/texts';
import { IDatetimeRange } from '../types/record/datetime-range';
import { ITimeRange } from '../types/record/time-range';
import { hm2str, ymd2str } from './ymdhm2str';

const vt = texts.date;

export const timeRange2str = (timeRange: ITimeRange): string =>
  `${hm2str(timeRange.start)}${vt.timeRangeTilde}${hm2str(timeRange.end)}`;

export const datetimeRange2str = (datetimeRange: IDatetimeRange): string =>
  `${ymd2str(datetimeRange.ymd)} ${timeRange2str(datetimeRange.timeRange)}`;
