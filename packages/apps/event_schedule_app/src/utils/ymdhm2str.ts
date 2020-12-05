import { getDay } from '@mono/ts-utils';
import { texts } from '../constants/texts';
import { IHoursMinutes } from '../types/record/base/hours-minutes';
import { IYearMonthDate } from '../types/record/base/year-month-date';
import { IYmdHm } from '../types/record/ymd-hm';
import { pad2 } from './pad2';
import { ymd2Date } from './ymdhm2date';

export const ymd2str = (ymd: IYearMonthDate): string => {
  const { year, month, date } = ymd;
  return `${year}/${pad2(month)}/${pad2(date)}`;
};

export const ymd2strWithDay = (ymd: IYearMonthDate): string => {
  const day = dayListWithBrace[getDay(ymd2Date(ymd))];
  return `${ymd2str(ymd)}${day ?? ''}`;
};

export const hm2str = (hm: IHoursMinutes): string => {
  const { hours, minutes } = hm;
  return `${pad2(hours)}:${pad2(minutes)}`;
};

export const ymdhm2str = (ymdhm: IYmdHm): string =>
  `${ymd2str(ymdhm.ymd)} ${hm2str(ymdhm.hm)}`;

const { dayList, dayWrapperBrace } = texts.date;

const dayListWithBrace = dayList.map(
  (c) => `${dayWrapperBrace.start}${c}${dayWrapperBrace.end}`
);

export const ymdhm2strWithDay = (ymdhm: IYmdHm): string =>
  `${ymd2strWithDay(ymdhm.ymd)} ${hm2str(ymdhm.hm)}`;
