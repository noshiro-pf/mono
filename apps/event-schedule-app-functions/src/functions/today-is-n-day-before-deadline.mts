import { asPositiveSafeInt, Num } from 'ts-data-forge';
import { DateUtils, type YearMonthDate, type Ymdhm } from 'ts-fortress-types';
import { type PositiveSafeInt } from 'ts-type-forge';
import { today } from '../utils/index.mjs';

const ymd2DateObject = (ymd: YearMonthDate): Date =>
  DateUtils.create(ymd.year, ymd.month, ymd.date);

const millisecOfADay: PositiveSafeInt = asPositiveSafeInt(24 * 3600 * 1000);

export const todayIsNDaysBeforeDeadline = (
  n: 0 | 1 | 3 | 7 | 14 | 28,
  answerDeadlineYmdhm: Ymdhm,
): boolean => {
  const answerDeadlineDate = ymd2DateObject(answerDeadlineYmdhm);

  const todayDate = ymd2DateObject(today());

  const daysDiff: number = Num.div(
    answerDeadlineDate.getTime() - todayDate.getTime(),
    millisecOfADay,
  );

  return daysDiff === n;
};
