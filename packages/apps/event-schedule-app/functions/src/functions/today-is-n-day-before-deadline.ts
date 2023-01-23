import { type YearMonthDate } from '@noshiro/event-schedule-app-shared';
import { DateUtils } from '@noshiro/ts-utils';
import { today } from '../utils';

const ymd2Date = (ymd: YearMonthDate): DateUtils =>
  DateUtils.create(ymd.year, ymd.month, ymd.date);

const millisecOfADay: number = 24 * 3600 * 1000;

export const todayIsNDaysBeforeDeadline = (
  n: number,
  answerDeadlineYmd: YearMonthDate
): boolean => {
  const answerDeadlineDate = ymd2Date(answerDeadlineYmd);
  const todayDate = ymd2Date(today());
  const daysDiff: number =
    (answerDeadlineDate.getTime() - todayDate.getTime()) / millisecOfADay;
  return daysDiff === n;
};
