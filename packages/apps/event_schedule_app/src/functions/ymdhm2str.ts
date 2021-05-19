import { texts } from '../constants';
import type { IHoursMinutes, IYearMonthDate, IYmdHm } from '../types';
import { ymd2day } from './ymd2day';

const { dayList, dayWrapperBrace } = texts.date;

const dayListWithBrace: readonly string[] = dayList.map(
  (c) => `${dayWrapperBrace.start}${c}${dayWrapperBrace.end}`
);

const pad2 = (n: number): string => n.toString().padStart(2, '0');

export const ymd2str = (ymd: IYearMonthDate): string => {
  const { year, month, date } = ymd;
  return `${year}/${pad2(month)}/${pad2(date)}`;
};

export const ymd2strWithDay = (ymd: IYearMonthDate): string => {
  const day = dayListWithBrace[ymd2day(ymd)];
  return `${ymd2str(ymd)}${day ?? ''}`;
};

export const hm2str = (hm: IHoursMinutes): string => {
  const { hours, minutes } = hm;
  return `${pad2(hours)}:${pad2(minutes)}`;
};

export const ymdhm2str = (ymdhm: IYmdHm): string =>
  `${ymd2str(ymdhm.ymd)} ${hm2str(ymdhm.hm)}`;

export const ymdhm2strWithDay = (ymdhm: IYmdHm): string =>
  `${ymd2strWithDay(ymdhm.ymd)} ${hm2str(ymdhm.hm)}`;
