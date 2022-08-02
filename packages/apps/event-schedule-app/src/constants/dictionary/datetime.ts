import { pad2, ymd2day } from '../../utils';
import { commonDictionary } from './common';

const { timeRangeTilde, dayList, dayWrapperBrace } = commonDictionary.date;

const dayListWithBrace: readonly string[] = dayList.map(
  (c) => `${dayWrapperBrace.start}${c}${dayWrapperBrace.end}`
);

export const ymd2str = (ymd: YearMonthDate): string => {
  const { year, month, date } = ymd;
  return `${year}/${pad2(month)}/${pad2(date)}`;
};

export const ymd2dayStr = (ymd: YearMonthDate): string =>
  dayListWithBrace[ymd2day(ymd)] ?? '';

export const ymd2strWithDay = (ymd: YearMonthDate): string =>
  `${ymd2str(ymd)}${ymd2dayStr(ymd)}`;

export const hm2str = (hm: HoursMinutes): string => {
  const { hours, minutes } = hm;
  return `${pad2(hours)}:${pad2(minutes)}`;
};

export const ymdhm2str = (ymdhm: Ymdhm): string =>
  `${ymd2str(ymdhm)} ${hm2str(ymdhm)}`;

export const ymdhm2strWithDay = (ymdhm: Ymdhm): string =>
  `${ymd2strWithDay(ymdhm)} ${hm2str(ymdhm)}`;

export const timeRange2str = (timeRange: TimeRange): string =>
  `${hm2str(timeRange.start)}${timeRangeTilde}${hm2str(timeRange.end)}`;

export const datetimeRange2str = (datetimeRange: DatetimeRange): string =>
  `${ymd2str(datetimeRange.ymd)}--${timeRange2str(datetimeRange.timeRange)}`;
