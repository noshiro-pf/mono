import { IRecord } from '../../utils/immutable';
import type { IHoursMinutes, PartialHoursMinutes } from './base/hours-minutes';
import {
  compareHm,
  createIHoursMinutes,
  fillHoursMinutes,
} from './base/hours-minutes';
import type {
  IYearMonthDate,
  PartialYearMonthDate,
} from './base/year-month-date';
import {
  compareYmd,
  createIYearMonthDate,
  fillYearMonthDate,
} from './base/year-month-date';

type YmdHmBaseType = Readonly<{
  ymd: IYearMonthDate;
  hm: IHoursMinutes;
}>;

export type PartialYmdHm = Partial<
  Readonly<{
    ymd: PartialYearMonthDate;
    hm: PartialHoursMinutes;
  }>
>;

export type IYmdHm = IRecord<YmdHmBaseType> & Readonly<YmdHmBaseType>;

const IYmdHmRecordFactory = IRecord<YmdHmBaseType>({
  ymd: createIYearMonthDate(),
  hm: createIHoursMinutes(),
});

export const createIYmdHm: (a?: YmdHmBaseType) => IYmdHm = IYmdHmRecordFactory;

const d = IYmdHmRecordFactory();
export const fillYmdHm = (p?: PartialYmdHm): IYmdHm =>
  createIYmdHm({
    ymd: fillYearMonthDate(p?.ymd ?? d.ymd),
    hm: fillHoursMinutes(p?.hm ?? d.hm),
  });

export const compareYmdHm = (a: IYmdHm, b: IYmdHm): -1 | 0 | 1 => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareHmResult = compareHm(a.hm, b.hm);
  if (compareHmResult !== 0) return compareHmResult;
  return 0;
};
