import { IDate } from '@noshiro/ts-utils';
import type {
  HoursMinutes,
  PartialHoursMinutes,
  PartialYearMonthDate,
  YearMonthDate,
} from './base';
import {
  compareHm,
  compareYmd,
  defaultHoursMinutes,
  defaultYearMonthDate,
  fillHoursMinutes,
  fillYearMonthDate,
  hmFromDate,
  ymdFromDate,
} from './base';

export type Ymdhm = Readonly<{
  ymd: YearMonthDate;
  hm: HoursMinutes;
}>;

export type PartialYmdhm = Partial<
  Readonly<{
    ymd: PartialYearMonthDate;
    hm: PartialHoursMinutes;
  }>
>;

export const defaultYmdhm: Ymdhm = {
  ymd: defaultYearMonthDate,
  hm: defaultHoursMinutes,
};

const d = defaultYmdhm;
export const fillYmdhm = (p?: PartialYmdhm): Ymdhm => ({
  ymd: fillYearMonthDate(p?.ymd ?? d.ymd),
  hm: fillHoursMinutes(p?.hm ?? d.hm),
});

export const ymdhmFromDate = (date: IDate): Ymdhm => ({
  ymd: ymdFromDate(date),
  hm: hmFromDate(date),
});

export const ymdhm2Date = (ymdhm: Ymdhm): IDate =>
  IDate.create(
    ymdhm.ymd.year,
    ymdhm.ymd.month,
    ymdhm.ymd.date,
    ymdhm.hm.hours,
    ymdhm.hm.minutes
  );

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareHmResult = compareHm(a.hm, b.hm);
  if (compareHmResult !== 0) return compareHmResult;
  return 0;
};
