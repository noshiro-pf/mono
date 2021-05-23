import type { DeepReadonly } from '@noshiro/ts-utils';
import { texts } from '../constants';
import type { IDatetimeRange, ITimeRange } from '../types';
import { hm2str, ymd2str } from './ymdhm2str';

const vt = texts.date;

export const timeRange2str = (timeRange: DeepReadonly<ITimeRange>): string =>
  `${hm2str(timeRange.start)}${vt.timeRangeTilde}${hm2str(timeRange.end)}`;

export const datetimeRange2str = (datetimeRange: IDatetimeRange): string =>
  `${ymd2str(datetimeRange.ymd)} ${timeRange2str(datetimeRange.timeRange)}`;
