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
): readonly (readonly YearMonthDate[])[] => {
  const numPrevMonthDates = DateUtils.getLocaleDayOfWeek(
    getFirstDateOfMonth(year, month)
  );
  const numNextMonthDates =
    7 -
    DateUtils.getLocaleDayOfWeek(
      getFirstDateOfMonth(year, (month + 1) as MonthEnum)
    );

  const lastDateNumberOfPrevMonth = getLastDateNumberOfMonth(
    year,
    (month - 1) as MonthIndexEnum
  );
  const lastDateNumberOfThisMonth = getLastDateNumberOfMonth(year, month);

  const cells1d: readonly YearMonthDate[] = Arr.concat(
    genYmdRangeList(
      year,
      (month - 1) as MonthEnum,
      (lastDateNumberOfPrevMonth - numPrevMonthDates + 1) as DateEnum,
      lastDateNumberOfPrevMonth
    ),
    Arr.concat(
      genYmdRangeList(year, month, 1, lastDateNumberOfThisMonth),
      genYmdRangeList(
        year,
        (month + 1) as MonthEnum,
        1,
        numNextMonthDates as DateEnum
      )
    )
  );

  const rowSize = numWeeks(year, month);

  return Arr.range(0, rowSize).map((i) =>
    cells1d.slice(Uint8.mul(7, i), Uint8.mul(7, Uint8.add(i, 1)))
  );
};

const genYmdRangeList = (
  year: YearEnum,
  month: MonthEnum,
  from: DateEnum,
  to: DateEnum
): readonly YearMonthDate[] =>
  Arr.range(from, Uint8.add(to, 1) as DateEnum | 32).map((n) => ({
    year,
    month,
    date: n,
  }));

const getFirstDateOfMonth = (year: YearEnum, month: MonthEnum): DateType =>
  new Date(year, (month - 1) as MonthIndexEnum, 1);

const getLastDateNumberOfMonth = (
  year: YearEnum,
  month: UintRange<0, 14> // 0 - 13
): 28 | 29 | 30 | 31 =>
  // 翌月の0日目を取得することで、前月の最終日を取得できる
  new Date(year, month as MonthIndexEnum, 0 as DateEnum).getDate() as Extract<
    DateEnum,
    28 | 29 | 30 | 31
  >;

const numWeeks = (year: YearEnum, month: MonthEnum): 4 | 5 | 6 => {
  const firstDate = getFirstDateOfMonth(year, month);
  const lastDateNumber = getLastDateNumberOfMonth(year, month);
  return Math.ceil(
    (DateUtils.getLocaleDayOfWeek(firstDate) + lastDateNumber) / 7
  ) as 4 | 5 | 6;
};
