import { YearMonthDateType } from './types/record/base/year-month-date';
import { today } from './utils/today';

const ymd2Date = (ymd: YearMonthDateType): Date =>
  new Date(`${ymd.year}-${ymd.month}-${ymd.date}`);

const millisecOfADay: number = 24 * 3600 * 1000;

export const todayIsNDaysBeforeDeadline = (
  n: number,
  answerDeadlineYmd: YearMonthDateType
): boolean => {
  const todayDate: Date = ymd2Date(today());
  const answerDeadlineDate: Date = ymd2Date(answerDeadlineYmd);
  const daysDiff: number =
    (answerDeadlineDate.getTime() - todayDate.getTime()) / millisecOfADay;
  return daysDiff === n;
};
