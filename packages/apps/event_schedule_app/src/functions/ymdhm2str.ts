import type {
  HoursMinutes,
  YearMonthDate,
  Ymdhm,
} from '@noshiro/event-schedule-app-shared';
import { dict } from '../constants';
import { pad2 } from '../utils';
import { ymd2day } from './ymd2day';

const { dayList, dayWrapperBrace } = dict.common.date;

const dayListWithBrace: readonly string[] = dayList.map(
  (c) => `${dayWrapperBrace.start}${c}${dayWrapperBrace.end}`
);

export const ymd2str = (ymd: YearMonthDate): string => {
  const { year, month, date } = ymd;
  return `${year}/${pad2(month)}/${pad2(date)}`;
};

export const ymd2strWithDay = (ymd: YearMonthDate): string => {
  const day = dayListWithBrace[ymd2day(ymd)];
  return `${ymd2str(ymd)}${day ?? ''}`;
};

export const hm2str = (hm: HoursMinutes): string => {
  const { hours, minutes } = hm;
  return `${pad2(hours)}:${pad2(minutes)}`;
};

export const ymdhm2str = (ymdhm: Ymdhm): string =>
  `${ymd2str(ymdhm)} ${hm2str(ymdhm)}`;

export const ymdhm2strWithDay = (ymdhm: Ymdhm): string =>
  `${ymd2strWithDay(ymdhm)} ${hm2str(ymdhm)}`;
