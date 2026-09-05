import { Arr, asUint32, Uint8 } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import {
  type DateEnum,
  type MonthEnum,
  type MonthIndexEnum,
  type SafeUint,
  type UintRange,
} from 'ts-type-forge';
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
  year: SafeUint,
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
    cells1d.slice(asUint32(7 * i), asUint32(7 * (i + 1))),
  );
};

const genYmdRangeList = (
  year: SafeUint,
  month: MonthEnum,
  from: DateEnum,
  to: DateEnum,
): readonly YearMonthDate[] =>
  Arr.range(
    from,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    Uint8.add(to, 1) as DateEnum | 32,
  ).map((n) => ({ year, month, date: n }));

// `DateUtils.create` takes the month as 1-12 and does the 0-based conversion
// itself. Writing `month - 1` here does not type-check under the strict
// standard library: it narrows `Date`'s month argument to 0-11, and
// subtraction widens to `number`.
const getFirstDateOfMonth = (year: SafeUint, month: MonthEnum): Date =>
  DateUtils.create(year, month, 1);

/**
 * その月の日数。
 *
 * 元は `new Date(year, month, 0)`（翌月の 0 日目 = 前月の最終日）で求めていたが、
 * strict standard library は `Date` の日引数を `DateEnum`（1-31）に絞るので
 * **0 日目という慣用句そのものが通らない**。月引数の 0-11 も同様で、
 * 12 月を表す番号 12 も渡せない。
 *
 * 算術で書けば `Date` を経由せずに済み、既存の
 * `as StrictExtract<DateEnum, 28 | 29 | 30 | 31>` も落とせる。
 *
 * 引数は呼び出し側の都合で 0-12。0 は前年の 12 月、12 はその年の 12 月を指し、
 * どちらも 31 日なので `default` にまとめている。
 */
const getLastDateNumberOfMonth = (
  year: SafeUint,
  month: UintRange<0, 13>,
): 28 | 29 | 30 | 31 => {
  switch (month) {
    case 2:
      return isLeapYear(year) ? 29 : 28;

    case 4:
    case 6:
    case 9:
    case 11:
      return 30;

    // 0 は前年の 12 月、12 はその年の 12 月。どちらも 31 日。
    case 0:
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      return 31;
  }
};

const isLeapYear = (year: SafeUint): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const numWeeks = (year: SafeUint, month: MonthEnum): 4 | 5 | 6 => {
  const firstDate = getFirstDateOfMonth(year, month);

  const lastDateNumber = getLastDateNumberOfMonth(year, month);

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return Math.ceil(
    (DateUtils.getLocaleDayOfWeek(firstDate) + lastDateNumber) / 7,
  ) as 4 | 5 | 6;
};
