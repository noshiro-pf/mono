import { IRecord, IRecordType } from '../../utils/immutable';
import { compareHm, IHoursMinutes, IHoursMinutesType } from './hours-minutes';
import {
  compareYmd,
  IYearMonthDate,
  IYearMonthDateType,
} from './year-month-date';

export type YmdHmType = {
  ymd: IYearMonthDateType;
  hm: IHoursMinutesType;
};

export const IYmdHm = IRecord<YmdHmType>({
  ymd: IYearMonthDate(),
  hm: IHoursMinutes(),
});

export type IYmdHmType = IRecordType<YmdHmType>;

export const compareYmdHm = (a: IYmdHmType, b: IYmdHmType): -1 | 0 | 1 => {
  const compareYmdResult = compareYmd(a.ymd, b.ymd);
  if (compareYmdResult !== 0) return compareYmdResult;
  const compareHmResult = compareHm(a.hm, b.hm);
  if (compareHmResult !== 0) return compareHmResult;
  return 0;
};
