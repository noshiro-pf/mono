import { Arr } from '../array';
import { Num } from '../num';

export type DateUtils = StrictOmit<
  RawDateType,
  | 'getDate'
  | 'getDay'
  | 'getFullYear'
  | 'getHours'
  | 'getMilliseconds'
  | 'getMinutes'
  | 'getMonth'
  | 'getSeconds'
  | 'getUTCDate'
  | 'getUTCDay'
  | 'getUTCFullYear'
  | 'getUTCHours'
  | 'getUTCMilliseconds'
  | 'getUTCMinutes'
  | 'getUTCMonth'
  | 'getUTCSeconds'
  | 'setDate'
  | 'setFullYear'
  | 'setHours'
  | 'setMilliseconds'
  | 'setMinutes'
  | 'setMonth'
  | 'setSeconds'
  | 'setUTCDate'
  | 'setUTCFullYear'
  | 'setUTCHours'
  | 'setUTCMilliseconds'
  | 'setUTCMinutes'
  | 'setUTCMonth'
  | 'setUTCSeconds'
>;

export namespace DateUtils {
  /* get */

  const getValueHelper = (
    date: DateUtils,
    getFn: (d: RawDateType) => number
  ): number => getFn(date as RawDateType);

  /** Gets the year, using local time. */
  export const getLocaleYear = (date: DateUtils): YearEnum =>
    getValueHelper(date, (d) => d.getFullYear());

  /** Gets the year using Universal Coordinated Time (UTC). */
  export const getUTCYear = (date: DateUtils): YearEnum =>
    getValueHelper(date, (d) => d.getUTCFullYear());

  /**
   * @description Gets the month, using local time.
   * @returns a number from 1 to 12
   */
  export const getLocaleMonth = (date: DateUtils): MonthEnum =>
    getValueHelper(date, (d) => d.getMonth() + 1) as MonthEnum;

  /**
   * @description Gets the month of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 1 to 12
   */
  export const getUTCMonth = (date: DateUtils): MonthEnum =>
    getValueHelper(date, (d) => d.getUTCMonth() + 1) as MonthEnum;

  /**
   * @description Gets the day-of-the-month, using local time.
   * @returns a number from 1 to 31
   */
  export const getLocaleDate = (date: DateUtils): DateEnum =>
    getValueHelper(date, (d) => d.getDate()) as DateEnum;

  /**
   * @description Gets the day-of-the-month, using Universal Coordinated Time (UTC).
   * @returns a number from 1 to 31
   */
  export const getUTCDate = (date: DateUtils): DateEnum =>
    getValueHelper(date, (d) => d.getUTCDate()) as DateEnum;

  /**
   * @description Gets the day of the week, using local time.
   * @returns a number from 0 to 6
   */
  export const getLocaleDayOfWeek = (date: DateUtils): DayOfWeekIndex =>
    getValueHelper(date, (d) => d.getDay()) as DayOfWeekIndex;

  /**
   * @description Gets the day of the week using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 6
   */
  export const getUTCDayOfWeek = (date: DateUtils): DayOfWeekIndex =>
    getValueHelper(date, (d) => d.getUTCDay()) as DayOfWeekIndex;

  /**
   * @description Gets the hours in a date, using local time.
   * @returns a number from 0 to 23
   */
  export const getLocaleHours = (date: DateUtils): HoursEnum =>
    getValueHelper(date, (d) => d.getHours()) as HoursEnum;

  /**
   * @description Gets the hours value in a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 23
   */
  export const getUTCHours = (date: DateUtils): HoursEnum =>
    getValueHelper(date, (d) => d.getUTCHours()) as HoursEnum;

  /**
   * @description Gets the minutes of a Date object, using local time.
   * @returns a number from 0 to 59
   */
  export const getLocaleMinutes = (date: DateUtils): MinutesEnum =>
    getValueHelper(date, (d) => d.getMinutes()) as MinutesEnum;

  /**
   * @description Gets the minutes of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 59
   */
  export const getUTCMinutes = (date: DateUtils): MinutesEnum =>
    getValueHelper(date, (d) => d.getUTCMinutes()) as MinutesEnum;

  /**
   * @description Gets the seconds of a Date object, using local time.
   * @returns a number from 0 to 59
   */
  export const getLocaleSeconds = (date: DateUtils): SecondsEnum =>
    getValueHelper(date, (d) => d.getSeconds()) as SecondsEnum;

  /**
   * @description Gets the seconds of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 999
   */
  export const getUTCSeconds = (date: DateUtils): SecondsEnum =>
    getValueHelper(date, (d) => d.getUTCSeconds()) as SecondsEnum;

  /**
   * @description Gets the milliseconds of a Date, using local time.
   * @returns a number from 0 to 999
   */
  export const getLocaleMilliseconds = (date: DateUtils): SecondsEnum =>
    getValueHelper(date, (d) => d.getMilliseconds()) as SecondsEnum;

  /**
   * @description Gets the milliseconds of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 999
   */
  export const getUTCMilliseconds = (date: DateUtils): SecondsEnum =>
    getValueHelper(date, (d) => d.getUTCMilliseconds()) as SecondsEnum;

  /* set */

  const setValueHelper =
    (setFn: (date: RawDateType) => void) =>
    (curr: DateUtils): DateUtils => {
      // eslint-disable-next-line no-restricted-globals
      const copy = new Date(curr as RawDateType);
      setFn(copy);
      return copy;
    };

  /** Sets the year of the Date object using local time. */
  export const setLocaleYear = (
    year: YearEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setFullYear(year);
    });

  /** Sets the year value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCYear = (
    year: YearEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCFullYear(year);
    });

  /** Sets the month value in the Date object using local time. */
  export const setLocaleMonth = (
    month: MonthEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setMonth(month - 1);
    });

  /** Sets the month value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCMonth = (
    month: MonthEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCMonth(month - 1);
    });

  /** Sets the numeric day-of-the-month value of the Date object using local time. */
  export const setLocaleDate = (
    date: DateEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setDate(date);
    });

  /** ets the numeric day of the month in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCDate = (
    date: DateEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCDate(date);
    });

  /** Sets the hour value in the Date object using local time. */
  export const setLocaleHours = (
    hours: HoursEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setHours(hours);
    });

  /** Sets the hours value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCHours = (
    hours: HoursEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCHours(hours);
    });

  /** Sets the minutes value in the Date object using local time. */
  export const setLocaleMinutes = (
    minutes: MinutesEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setMinutes(minutes);
    });

  /** Sets the minutes value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCMinutes = (
    minutes: MinutesEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCMinutes(minutes);
    });

  /** Sets the seconds value in the Date object using local time. */
  export const setLocaleSeconds = (
    seconds: SecondsEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setSeconds(seconds);
    });

  /** Sets the seconds value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCSeconds = (
    seconds: SecondsEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCSeconds(seconds);
    });

  /** Sets the milliseconds value in the Date object using local time. */
  export const setLocaleMilliseconds = (
    milliseconds: MillisecondsEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setMilliseconds(milliseconds);
    });

  /** Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCMilliseconds = (
    milliseconds: MillisecondsEnum
  ): ((curr: DateUtils) => DateUtils) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCMilliseconds(milliseconds);
    });

  /* update */

  export const updateLocaleYear =
    (updater: (year: YearEnum) => YearEnum) =>
    (curr: DateUtils): DateUtils =>
      setLocaleYear(updater(getLocaleYear(curr)))(curr);

  export const updateUTCYear =
    (updater: (year: YearEnum) => YearEnum) =>
    (curr: DateUtils): DateUtils =>
      setUTCYear(updater(getUTCYear(curr)))(curr);

  export const updateLocaleMonth =
    (updater: (month: MonthEnum) => MonthEnum) =>
    (curr: DateUtils): DateUtils =>
      setLocaleMonth(updater(getLocaleMonth(curr)))(curr);

  export const updateUTCMonth =
    (updater: (month: MonthEnum) => MonthEnum) =>
    (curr: DateUtils): DateUtils =>
      setUTCMonth(updater(getUTCMonth(curr)))(curr);

  export const updateLocaleDate =
    (updater: (date: DateEnum) => DateEnum) =>
    (curr: DateUtils): DateUtils =>
      setLocaleDate(updater(getLocaleDate(curr)))(curr);

  export const updateUTCDate =
    (updater: (date: DateEnum) => DateEnum) =>
    (curr: DateUtils): DateUtils =>
      setUTCDate(updater(getUTCDate(curr)))(curr);

  export const updateLocaleHours =
    (updater: (hour: HoursEnum) => HoursEnum) =>
    (curr: DateUtils): DateUtils =>
      setLocaleHours(updater(getLocaleHours(curr)))(curr);

  export const updateUTCHours =
    (updater: (hour: HoursEnum) => HoursEnum) =>
    (curr: DateUtils): DateUtils =>
      setUTCHours(updater(getUTCHours(curr)))(curr);

  export const updateLocaleMinutes =
    (updater: (minutes: MinutesEnum) => MinutesEnum) =>
    (curr: DateUtils): DateUtils =>
      setLocaleMinutes(updater(getLocaleMinutes(curr)))(curr);

  export const updateUTCMinutes =
    (updater: (minutes: MinutesEnum) => MinutesEnum) =>
    (curr: DateUtils): DateUtils =>
      setUTCMinutes(updater(getUTCMinutes(curr)))(curr);

  export const updateLocaleSeconds =
    (updater: (seconds: SecondsEnum) => SecondsEnum) =>
    (curr: DateUtils): DateUtils =>
      setLocaleSeconds(updater(getLocaleSeconds(curr)))(curr);

  export const updateUTCSeconds =
    (updater: (seconds: SecondsEnum) => SecondsEnum) =>
    (curr: DateUtils): DateUtils =>
      setUTCSeconds(updater(getUTCSeconds(curr)))(curr);

  export const updateLocaleMilliseconds =
    (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
    (curr: DateUtils): DateUtils =>
      setLocaleMilliseconds(updater(getLocaleMilliseconds(curr)))(curr);

  export const updateUTCMilliseconds =
    (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
    (curr: DateUtils): DateUtils =>
      setUTCMilliseconds(updater(getUTCMilliseconds(curr)))(curr);

  /* create  */

  // eslint-disable-next-line no-restricted-globals
  export const today = (): DateUtils => new Date();

  // eslint-disable-next-line no-restricted-globals
  export const now = (): number => Date.now();

  export const create = (
    year: YearEnum,
    month: MonthEnum,
    date: DateEnum = 1,
    hours: HoursEnum = 0,
    minutes: MinutesEnum = 0,
    seconds: SecondsEnum = 0,
    ms: number = 0
    // eslint-disable-next-line no-restricted-globals
  ): DateUtils => new Date(year, month - 1, date, hours, minutes, seconds, ms);

  export const from = (value: RawDateType | number | string): DateUtils =>
    // eslint-disable-next-line no-restricted-globals
    new Date(value);

  /* timestamp */

  /** Parses a string containing a date, and returns the number of milliseconds between that date and midnight, January 1, 1970. */
  export const parse = (str: string): number | undefined => {
    // eslint-disable-next-line no-restricted-globals
    const res = Date.parse(str);
    return Num.isNaN(res) ? undefined : res;
  };

  /** Gets the time value in milliseconds. */
  export const toTimestamp = (d: DateUtils): number => d.getTime();

  /* yesterday & tomorrow */

  export const getLocaleYesterday = updateLocaleDate(
    (d) => (d - 1) as DateEnum
  );

  export const getLocaleTomorrow = updateLocaleDate((d) => (d + 1) as DateEnum);

  /* convert */

  export const toMidnight = (date: DateUtils): DateUtils => {
    // eslint-disable-next-line no-restricted-globals
    const mut_midnight = new Date(date as RawDateType);
    mut_midnight.setHours(0, 0, 0, 0);
    return mut_midnight;
  };

  export const toDate = (date: DateUtils): RawDateType => date as RawDateType;

  /**
   * ```
   * date1  <  date2 --> -1
   * date1  >  date2 -->  1
   * date1 === date2 -->  0
   * ```
   */
  export const cmp = (x: DateUtils, y: DateUtils): -1 | 0 | 1 => {
    const date1value = toTimestamp(x);
    const date2value = toTimestamp(y);

    if (date1value < date2value) return -1;
    if (date1value > date2value) return 1;

    return 0;
  };

  export const isToday = (date: DateUtils): boolean => cmp(date, today()) === 0;

  /** @description 何週目か(0-origin)を返す */
  export const weekNumberLocale = (date: DateUtils): 0 | 1 | 2 | 3 | 4 | 5 => {
    const date0Saturday =
      getLocaleDate(date) - 1 + (6 - getLocaleDayOfWeek(date)); // 同じ週の土曜日

    return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
  };

  /** @description 何週目か(0-origin)を返す */
  export const weekNumberUTC = (date: DateUtils): 0 | 1 | 2 | 3 | 4 | 5 => {
    const date0Saturday = getUTCDate(date) - 1 + (6 - getLocaleDayOfWeek(date)); // 同じ週の土曜日

    return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
  };

  /**
   * @description 引数の日が含まれる月の最終日(28-31)の数値を返す
   */
  export const getLastDateNumberOfMonth = (
    year: YearEnum,
    month: MonthEnum
  ): DateEnum =>
    getLocaleDate(create(year, (month + 1) as MonthEnum, 0 as DateEnum));

  export const getAllDatesOfMonth = (
    year: YearEnum,
    month: MonthEnum
  ): readonly DateUtils[] =>
    Arr.rangeUnwrapped(1, getLastDateNumberOfMonth(year, month) + 1).map(
      (date) => create(year, month, date as DateEnum)
    );

  export const numWeeksOfMonth = (year: YearEnum, month: MonthEnum): number => {
    const lastDateNumber = getLastDateNumberOfMonth(year, month);
    const lastDate = setLocaleDate(lastDateNumber)(create(year, month));

    return weekNumberLocale(lastDate) + 1;
  };

  /* format */

  const pad2 = (str: number): string => str.toString().padStart(2, '0');

  export const toLocaleYMD = (
    date: DateUtils,
    delimiter: string = '/'
  ): string =>
    [
      getLocaleYear(date),
      pad2(getLocaleMonth(date)),
      pad2(getLocaleDate(date)),
    ].join(delimiter);

  export const toLocaleHM = (
    date: DateUtils,
    delimiter: string = ':'
  ): string =>
    [pad2(getLocaleHours(date)), pad2(getLocaleMinutes(date))].join(delimiter);

  export const toLocaleHMS = (
    date: DateUtils,
    delimiter: string = ':'
  ): string =>
    [
      pad2(getLocaleHours(date)),
      pad2(getLocaleMinutes(date)),
      pad2(getLocaleSeconds(date)),
    ].join(delimiter);

  export const toLocaleYMDHMS = (
    date: DateUtils,
    delimiterForYMD: string = '/',
    delimiterForHMS: string = ':'
  ): string =>
    [
      toLocaleYMD(date, delimiterForYMD),
      toLocaleHMS(date, delimiterForHMS),
    ].join(' ');
}
