import type { YearMonthDate } from '@noshiro/event-schedule-app-api';
import { today } from './utils';

const ymd2Date = (ymd: YearMonthDate): Date =>
  new Date(`${ymd.year}-${ymd.month}-${ymd.date}`);

const millisecOfADay: number = 24 * 3600 * 1000;

export const todayIsNDaysBeforeDeadline = (
  n: number,
  answerDeadlineYmd: YearMonthDate
): boolean => {
  const todayDate: Date = ymd2Date(today());
  const answerDeadlineDate: Date = ymd2Date(answerDeadlineYmd);
  const daysDiff: number =
    (answerDeadlineDate.getTime() - todayDate.getTime()) / millisecOfADay;
  return daysDiff === n;
};
