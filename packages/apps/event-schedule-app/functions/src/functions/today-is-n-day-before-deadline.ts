import { type YearMonthDate, type Ymdhm } from '@noshiro/io-ts-types';
import {
  DateUtils,
  Num,
  SafeInt,
  toPositiveSafeInt,
  type DateType,
} from '@noshiro/ts-utils';
import { today } from '../utils/index.js';

const ymd2DateObject = (ymd: YearMonthDate): DateType =>
  DateUtils.create(ymd.year, ymd.month, ymd.date);

const millisecOfADay: PositiveSafeInt = toPositiveSafeInt(24 * 3600 * 1000);

export const todayIsNDaysBeforeDeadline = (
  n: 0 | 1 | 3 | 7 | 14 | 28,
  answerDeadlineYmdhm: Ymdhm,
): boolean => {
  const answerDeadlineDate = ymd2DateObject(answerDeadlineYmdhm);
  const todayDate = ymd2DateObject(today());
  const daysDiff: number = Num.div(
    SafeInt.sub(answerDeadlineDate.getTime(), todayDate.getTime()),
    millisecOfADay,
  );
  return daysDiff === n;
};
