import { DateEnum, getDay, MonthEnum, YearEnum } from '@noshiro/ts-utils';
import {
  createIYearMonthDate,
  IYearMonthDate,
} from '../../types/record/base/year-month-date';
import { IList, IRange } from '../../utils/immutable';

/**
 * rowsize = 5
 * numPrevMonthDate = 3
 * lastDateNumberOfPrevMonth = 30
 * lastDateNumberOfThisMonth = 31
 *
 * |Su|Mo|Tu|We|Th|Fr|Sa|
 * |--|--|--|--|--|--|--|
 * |28|29|30| 1| 2| 3| 4| --+
 * | 5| 6| 7| 8| 9|10|11|   |
 * |12|13|14|15|16|17|18|   | rowsize
 * |19|20|21|22|23|24|25|   |
 * |26|27|28|29|30|31| 1| --+
 */

export const generateCalendar = (
  year: YearEnum,
  month: MonthEnum
): IList<IList<IYearMonthDate>> => {
  const numPrevMonthDates = getDay(getFirstDateOfMonth(year, month));
  const numNextMonthDates =
    7 - getDay(getFirstDateOfMonth(year, (month + 1) as MonthEnum));
  const lastDateNumberOfPrevMonth = getLastDateNumberOfMonth(year, month - 1);
  const lastDateNumberOfThisMonth = getLastDateNumberOfMonth(year, month);

  const cells1d = genYmdRangeList(
    year,
    (month - 1) as MonthEnum,
    (lastDateNumberOfPrevMonth - numPrevMonthDates + 1) as DateEnum,
    lastDateNumberOfPrevMonth
  ).concat(
    genYmdRangeList(year, month, 1, lastDateNumberOfThisMonth),
    genYmdRangeList(
      year,
      (month + 1) as MonthEnum,
      1,
      numNextMonthDates as DateEnum
    )
  );

  const rowSize = numWeeks(year, month);

  return IRange(0, rowSize)
    .map((i) => cells1d.slice(7 * i, 7 * (i + 1)))
    .toList();
};

const genYmdRangeList = (
  year: YearEnum,
  month: MonthEnum,
  from: DateEnum,
  to: DateEnum
): IList<IYearMonthDate> =>
  IRange(from, to + 1)
    .map((n) => createIYearMonthDate({ year, month, date: n as DateEnum }))
    .toList();

const getFirstDateOfMonth = (year: YearEnum, month: MonthEnum): Date =>
  new Date(year, month - 1, 1);

const getLastDateNumberOfMonth = (
  year: YearEnum,
  month: number // 0 - 13
): DateEnum & (28 | 29 | 30 | 31) =>
  new Date(year, month, 0).getDate() as DateEnum & (28 | 29 | 30 | 31);

const numWeeks = (year: YearEnum, month: MonthEnum): 4 | 5 | 6 => {
  const firstDate = getFirstDateOfMonth(year, month);
  const lastDateNumber = getLastDateNumberOfMonth(year, month);
  return Math.ceil((firstDate.getDay() + lastDateNumber) / 7) as 4 | 5 | 6;
};
