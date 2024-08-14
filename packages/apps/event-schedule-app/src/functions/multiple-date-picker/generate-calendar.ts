/**
 * ```js
 * rowsize = 5;
 * numPrevMonthDate = 3;
 * lastDateNumberOfPrevMonth = 30;
 * lastDateNumberOfThisMonth = 31;
 * ```
 *
 *     |Su|Mo|Tu|We|Th|Fr|Sa|
 *     |--|--|--|--|--|--|--|
 *     |28|29|30| 1| 2| 3| 4| --+
 *     | 5| 6| 7| 8| 9|10|11|   |
 *     |12|13|14|15|16|17|18|   | rowsize
 *     |19|20|21|22|23|24|25|   |
 *     |26|27|28|29|30|31| 1| --+
 */

export const generateCalendar = (
  year: YearEnum,
  month: MonthEnum,
): readonly (readonly YearMonthDate[])[] => {
  const numPrevMonthDates = DateUtils.getLocaleDayOfWeek(
    getFirstDateOfMonth(year, month),
  );
  const numNextMonthDates =
    7 -
    DateUtils.getLocaleDayOfWeek(
      getFirstDateOfMonth(
        year,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (month + 1) as MonthEnum,
      ),
    );

  const lastDateNumberOfPrevMonth = getLastDateNumberOfMonth(
    year,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (month - 1) as MonthIndexEnum,
  );
  const lastDateNumberOfThisMonth = getLastDateNumberOfMonth(year, month);

  const cells1d: readonly YearMonthDate[] = Arr.concat(
    genYmdRangeList(
      year,
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (month - 1) as MonthEnum,
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (lastDateNumberOfPrevMonth - numPrevMonthDates + 1) as DateEnum,
      lastDateNumberOfPrevMonth,
    ),
    Arr.concat(
      genYmdRangeList(year, month, 1, lastDateNumberOfThisMonth),
      genYmdRangeList(
        year,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (month + 1) as MonthEnum,
        1,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        numNextMonthDates as DateEnum,
      ),
    ),
  );

  const rowSize = numWeeks(year, month);

  return Arr.range(0, rowSize).map((i) =>
    cells1d.slice(toUint32(7 * i), toUint32(7 * (i + 1))),
  );
};

const genYmdRangeList = (
  year: YearEnum,
  month: MonthEnum,
  from: DateEnum,
  to: DateEnum,
): readonly YearMonthDate[] =>
  Arr.range(
    from,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Uint8.add(to, 1) as DateEnum | 32,
  ).map((n) => ({
    year,
    month,
    date: n,
  }));

const getFirstDateOfMonth = (year: YearEnum, month: MonthEnum): DateType =>
  new Date(
    year,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    (month - 1) as MonthIndexEnum,
    1,
  );

const getLastDateNumberOfMonth = (
  year: YearEnum,
  month: UintRange<0, 14>, // 0 - 13
): 28 | 29 | 30 | 31 =>
  // 翌月の0日目を取得することで、前月の最終日を取得できる

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  new Date(
    year,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    month as MonthIndexEnum,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    0 as DateEnum,
  ).getDate() as Extract<DateEnum, 28 | 29 | 30 | 31>;

const numWeeks = (year: YearEnum, month: MonthEnum): 4 | 5 | 6 => {
  const firstDate = getFirstDateOfMonth(year, month);
  const lastDateNumber = getLastDateNumberOfMonth(year, month);

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Math.ceil(
    (DateUtils.getLocaleDayOfWeek(firstDate) + lastDateNumber) / 7,
  ) as 4 | 5 | 6;
};
