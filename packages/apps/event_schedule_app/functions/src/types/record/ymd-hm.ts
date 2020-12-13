import { compareHm, HoursMinutesType } from './base/hours-minutes';
import { compareYmd, YearMonthDateType } from './base/year-month-date';

export type YmdHmJsType = {
  ymd: YearMonthDateType;
  hm: HoursMinutesType;
};

export const compareYmdHm = (a: YmdHmJsType, b: YmdHmJsType): -1 | 0 | 1 => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareHmResult = compareHm(a.hm, b.hm);
  if (compareHmResult !== 0) return compareHmResult;
  return 0;
};
