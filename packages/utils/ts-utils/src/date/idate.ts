import { IList } from '../collections';
import { Num } from '../num';

export type IDate = StrictOmit<
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

export namespace IDate {
  /* get */

  const getValueHelper = (
    date: IDate,
    getFn: (d: RawDateType) => number
  ): number => getFn(date as RawDateType);

  /** Gets the year, using local time. */
  export const getLocaleYear = (date: IDate): YearEnum =>
    getValueHelper(date, (d) => d.getFullYear());

  /** Gets the year using Universal Coordinated Time (UTC). */
  export const getUTCYear = (date: IDate): YearEnum =>
    getValueHelper(date, (d) => d.getUTCFullYear());

  /**
   * @description Gets the month, using local time.
   * @returns a number from 1 to 12
   */
  export const getLocaleMonth = (date: IDate): MonthEnum =>
    getValueHelper(date, (d) => d.getMonth() + 1) as MonthEnum;

  /**
   * @description Gets the month of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 1 to 12
   */
  export const getUTCMonth = (date: IDate): MonthEnum =>
    getValueHelper(date, (d) => d.getUTCMonth() + 1) as MonthEnum;

  /**
   * @description Gets the day-of-the-month, using local time.
   * @returns a number from 1 to 31
   */
  export const getLocaleDate = (date: IDate): DateEnum =>
    getValueHelper(date, (d) => d.getDate()) as DateEnum;

  /**
   * @description Gets the day-of-the-month, using Universal Coordinated Time (UTC).
   * @returns a number from 1 to 31
   */
  export const getUTCDate = (date: IDate): DateEnum =>
    getValueHelper(date, (d) => d.getUTCDate()) as DateEnum;

  /**
   * @description Gets the day of the week, using local time.
   * @returns a number from 0 to 6
   */
  export const getLocaleDayOfWeek = (date: IDate): DayOfWeekIndex =>
    getValueHelper(date, (d) => d.getDay()) as DayOfWeekIndex;

  /**
   * @description Gets the day of the week using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 6
   */
  export const getUTCDayOfWeek = (date: IDate): DayOfWeekIndex =>
    getValueHelper(date, (d) => d.getUTCDay()) as DayOfWeekIndex;

  /**
   * @description Gets the hours in a date, using local time.
   * @returns a number from 0 to 23
   */
  export const getLocaleHours = (date: IDate): HoursEnum =>
    getValueHelper(date, (d) => d.getHours()) as HoursEnum;

  /**
   * @description Gets the hours value in a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 23
   */
  export const getUTCHours = (date: IDate): HoursEnum =>
    getValueHelper(date, (d) => d.getUTCHours()) as HoursEnum;

  /**
   * @description Gets the minutes of a Date object, using local time.
   * @returns a number from 0 to 59
   */
  export const getLocaleMinutes = (date: IDate): MinutesEnum =>
    getValueHelper(date, (d) => d.getMinutes()) as MinutesEnum;

  /**
   * @description Gets the minutes of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 59
   */
  export const getUTCMinutes = (date: IDate): MinutesEnum =>
    getValueHelper(date, (d) => d.getUTCMinutes()) as MinutesEnum;

  /**
   * @description Gets the seconds of a Date object, using local time.
   * @returns a number from 0 to 59
   */
  export const getLocaleSeconds = (date: IDate): SecondsEnum =>
    getValueHelper(date, (d) => d.getSeconds()) as SecondsEnum;

  /**
   * @description Gets the seconds of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 999
   */
  export const getUTCSeconds = (date: IDate): SecondsEnum =>
    getValueHelper(date, (d) => d.getUTCSeconds()) as SecondsEnum;

  /**
   * @description Gets the milliseconds of a Date, using local time.
   * @returns a number from 0 to 999
   */
  export const getLocaleMilliseconds = (date: IDate): SecondsEnum =>
    getValueHelper(date, (d) => d.getMilliseconds()) as SecondsEnum;

  /**
   * @description Gets the milliseconds of a Date object using Universal Coordinated Time (UTC).
   * @returns a number from 0 to 999
   */
  export const getUTCMilliseconds = (date: IDate): SecondsEnum =>
    getValueHelper(date, (d) => d.getUTCMilliseconds()) as SecondsEnum;

  /* set */

  const setValueHelper =
    (setFn: (date: RawDateType) => void) =>
    (curr: IDate): IDate => {
      // eslint-disable-next-line no-restricted-globals
      const copy = new Date(curr as RawDateType);
      setFn(copy);
      return copy;
    };

  /** Sets the year of the Date object using local time. */
  export const setLocaleYear = (year: YearEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setFullYear(year);
    });

  /** Sets the year value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCYear = (year: YearEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCFullYear(year);
    });

  /** Sets the month value in the Date object using local time. */
  export const setLocaleMonth = (month: MonthEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setMonth(month - 1);
    });

  /** Sets the month value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCMonth = (month: MonthEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCMonth(month - 1);
    });

  /** Sets the numeric day-of-the-month value of the Date object using local time. */
  export const setLocaleDate = (date: DateEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setDate(date);
    });

  /** ets the numeric day of the month in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCDate = (date: DateEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCDate(date);
    });

  /** Sets the hour value in the Date object using local time. */
  export const setLocaleHours = (hours: HoursEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setHours(hours);
    });

  /** Sets the hours value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCHours = (hours: HoursEnum): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCHours(hours);
    });

  /** Sets the minutes value in the Date object using local time. */
  export const setLocaleMinutes = (
    minutes: MinutesEnum
  ): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setMinutes(minutes);
    });

  /** Sets the minutes value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCMinutes = (
    minutes: MinutesEnum
  ): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCMinutes(minutes);
    });

  /** Sets the seconds value in the Date object using local time. */
  export const setLocaleSeconds = (
    seconds: SecondsEnum
  ): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setSeconds(seconds);
    });

  /** Sets the seconds value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCSeconds = (
    seconds: SecondsEnum
  ): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCSeconds(seconds);
    });

  /** Sets the milliseconds value in the Date object using local time. */
  export const setLocaleMilliseconds = (
    milliseconds: MillisecondsEnum
  ): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setMilliseconds(milliseconds);
    });

  /** Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC). */
  export const setUTCMilliseconds = (
    milliseconds: MillisecondsEnum
  ): ((curr: IDate) => IDate) =>
    setValueHelper((mut_copy) => {
      mut_copy.setUTCMilliseconds(milliseconds);
    });

  /* update */

  export const updateLocaleYear =
    (updater: (year: YearEnum) => YearEnum) =>
    (curr: IDate): IDate =>
      setLocaleYear(updater(getLocaleYear(curr)))(curr);

  export const updateUTCYear =
    (updater: (year: YearEnum) => YearEnum) =>
    (curr: IDate): IDate =>
      setUTCYear(updater(getUTCYear(curr)))(curr);

  export const updateLocaleMonth =
    (updater: (month: MonthEnum) => MonthEnum) =>
    (curr: IDate): IDate =>
      setLocaleMonth(updater(getLocaleMonth(curr)))(curr);

  export const updateUTCMonth =
    (updater: (month: MonthEnum) => MonthEnum) =>
    (curr: IDate): IDate =>
      setUTCMonth(updater(getUTCMonth(curr)))(curr);

  export const updateLocaleDate =
    (updater: (date: DateEnum) => DateEnum) =>
    (curr: IDate): IDate =>
      setLocaleDate(updater(getLocaleDate(curr)))(curr);

  export const updateUTCDate =
    (updater: (date: DateEnum) => DateEnum) =>
    (curr: IDate): IDate =>
      setUTCDate(updater(getUTCDate(curr)))(curr);

  export const updateLocaleHours =
    (updater: (hour: HoursEnum) => HoursEnum) =>
    (curr: IDate): IDate =>
      setLocaleHours(updater(getLocaleHours(curr)))(curr);

  export const updateUTCHours =
    (updater: (hour: HoursEnum) => HoursEnum) =>
    (curr: IDate): IDate =>
      setUTCHours(updater(getUTCHours(curr)))(curr);

  export const updateLocaleMinutes =
    (updater: (minutes: MinutesEnum) => MinutesEnum) =>
    (curr: IDate): IDate =>
      setLocaleMinutes(updater(getLocaleMinutes(curr)))(curr);

  export const updateUTCMinutes =
    (updater: (minutes: MinutesEnum) => MinutesEnum) =>
    (curr: IDate): IDate =>
      setUTCMinutes(updater(getUTCMinutes(curr)))(curr);

  export const updateLocaleSeconds =
    (updater: (seconds: SecondsEnum) => SecondsEnum) =>
    (curr: IDate): IDate =>
      setLocaleSeconds(updater(getLocaleSeconds(curr)))(curr);

  export const updateUTCSeconds =
    (updater: (seconds: SecondsEnum) => SecondsEnum) =>
    (curr: IDate): IDate =>
      setUTCSeconds(updater(getUTCSeconds(curr)))(curr);

  export const updateLocaleMilliseconds =
    (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
    (curr: IDate): IDate =>
      setLocaleMilliseconds(updater(getLocaleMilliseconds(curr)))(curr);

  export const updateUTCMilliseconds =
    (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
    (curr: IDate): IDate =>
      setUTCMilliseconds(updater(getUTCMilliseconds(curr)))(curr);

  /* create  */

  // eslint-disable-next-line no-restricted-globals
  export const today = (): IDate => new Date();

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
  ): IDate => new Date(year, month - 1, date, hours, minutes, seconds, ms);

  export const from = (value: RawDateType | number | string): IDate =>
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
  export const toTimestamp = (d: IDate): number => d.getTime();

  /* yesterday & tomorrow */

  export const getLocaleYesterday = updateLocaleDate(
    (d) => (d - 1) as DateEnum
  );

  export const getLocaleTomorrow = updateLocaleDate((d) => (d + 1) as DateEnum);

  /* convert */

  export const toMidnight = (date: IDate): IDate => {
    // eslint-disable-next-line no-restricted-globals
    const mut_midnight = new Date(date as RawDateType);
    mut_midnight.setHours(0, 0, 0, 0);
    return mut_midnight;
  };

  export const toDate = (date: IDate): RawDateType => date as RawDateType;

  /**
   * ```
   * date1  <  date2 --> -1
   * date1  >  date2 -->  1
   * date1 === date2 -->  0
   * ```
   */
  export const cmp = (x: IDate, y: IDate): -1 | 0 | 1 => {
    const date1value = toTimestamp(x);
    const date2value = toTimestamp(y);

    if (date1value < date2value) return -1;
    if (date1value > date2value) return 1;

    return 0;
  };

  export const isToday = (date: IDate): boolean => cmp(date, today()) === 0;

  /** @description 何週目か(0-origin)を返す */
  export const weekNumberLocale = (date: IDate): 0 | 1 | 2 | 3 | 4 | 5 => {
    const date0Saturday =
      getLocaleDate(date) - 1 + (6 - getLocaleDayOfWeek(date)); // 同じ週の土曜日

    return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
  };

  /** @description 何週目か(0-origin)を返す */
  export const weekNumberUTC = (date: IDate): 0 | 1 | 2 | 3 | 4 | 5 => {
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
  ): readonly IDate[] =>
    IList.rangeUnwrapped(1, getLastDateNumberOfMonth(year, month) + 1).map(
      (date) => create(year, month, date as DateEnum)
    );

  export const numWeeksOfMonth = (year: YearEnum, month: MonthEnum): number => {
    const lastDateNumber = getLastDateNumberOfMonth(year, month);
    const lastDate = setLocaleDate(lastDateNumber)(create(year, month));

    return weekNumberLocale(lastDate) + 1;
  };

  /* format */

  const pad2 = (str: number): string => str.toString().padStart(2, '0');

  export const toLocaleYMD = (date: IDate, delimiter: string = '/'): string =>
    [
      getLocaleYear(date),
      pad2(getLocaleMonth(date)),
      pad2(getLocaleDate(date)),
    ].join(delimiter);

  export const toLocaleHM = (date: IDate, delimiter: string = ':'): string =>
    [pad2(getLocaleHours(date)), pad2(getLocaleMinutes(date))].join(delimiter);

  export const toLocaleHMS = (date: IDate, delimiter: string = ':'): string =>
    [
      pad2(getLocaleHours(date)),
      pad2(getLocaleMinutes(date)),
      pad2(getLocaleSeconds(date)),
    ].join(delimiter);

  export const toLocaleYMDHMS = (
    date: IDate,
    delimiterForYMD: string = '/',
    delimiterForHMS: string = ':'
  ): string =>
    [
      toLocaleYMD(date, delimiterForYMD),
      toLocaleHMS(date, delimiterForHMS),
    ].join(' ');
}
