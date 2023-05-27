import { Arr } from '../array';
import { Uint8 } from '../num';

export type DateUtils = Omit<
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

/* get */

const getValueHelper = (
  date: DateUtils,
  getFn: (d: RawDateType) => number
): number => getFn(date as RawDateType);

/** Gets the year, using local time. */
const getLocaleYear = (date: DateUtils): YearEnum =>
  getValueHelper(date, (d) => d.getFullYear()) as YearEnum;

/** Gets the year using Universal Coordinated Time (UTC). */
const getUTCYear = (date: DateUtils): YearEnum =>
  getValueHelper(date, (d) => d.getUTCFullYear()) as YearEnum;

/**
 * @description Gets the month, using local time.
 * @returns a number from 1 to 12
 */
const getLocaleMonth = (date: DateUtils): MonthEnum =>
  getValueHelper(date, (d) => d.getMonth() + 1) as MonthEnum;

/**
 * @description Gets the month of a Date object using Universal Coordinated Time (UTC).
 * @returns a number from 1 to 12
 */
const getUTCMonth = (date: DateUtils): MonthEnum =>
  getValueHelper(date, (d) => d.getUTCMonth() + 1) as MonthEnum;

/**
 * @description Gets the day-of-the-month, using local time.
 * @returns a number from 1 to 31
 */
const getLocaleDate = (date: DateUtils): DateEnum =>
  getValueHelper(date, (d) => d.getDate()) as DateEnum;

/**
 * @description Gets the day-of-the-month, using Universal Coordinated Time (UTC).
 * @returns a number from 1 to 31
 */
const getUTCDate = (date: DateUtils): DateEnum =>
  getValueHelper(date, (d) => d.getUTCDate()) as DateEnum;

/**
 * @description Gets the day of the week, using local time.
 * @returns a number from 0 to 6
 */
const getLocaleDayOfWeek = (date: DateUtils): DayOfWeekIndex =>
  getValueHelper(date, (d) => d.getDay()) as DayOfWeekIndex;

/**
 * @description Gets the day of the week using Universal Coordinated Time (UTC).
 * @returns a number from 0 to 6
 */
const getUTCDayOfWeek = (date: DateUtils): DayOfWeekIndex =>
  getValueHelper(date, (d) => d.getUTCDay()) as DayOfWeekIndex;

/**
 * @description Gets the hours in a date, using local time.
 * @returns a number from 0 to 23
 */
const getLocaleHours = (date: DateUtils): HoursEnum =>
  getValueHelper(date, (d) => d.getHours()) as HoursEnum;

/**
 * @description Gets the hours value in a Date object using Universal Coordinated Time (UTC).
 * @returns a number from 0 to 23
 */
const getUTCHours = (date: DateUtils): HoursEnum =>
  getValueHelper(date, (d) => d.getUTCHours()) as HoursEnum;

/**
 * @description Gets the minutes of a Date object, using local time.
 * @returns a number from 0 to 59
 */
const getLocaleMinutes = (date: DateUtils): MinutesEnum =>
  getValueHelper(date, (d) => d.getMinutes()) as MinutesEnum;

/**
 * @description Gets the minutes of a Date object using Universal Coordinated Time (UTC).
 * @returns a number from 0 to 59
 */
const getUTCMinutes = (date: DateUtils): MinutesEnum =>
  getValueHelper(date, (d) => d.getUTCMinutes()) as MinutesEnum;

/**
 * @description Gets the seconds of a Date object, using local time.
 * @returns a number from 0 to 59
 */
const getLocaleSeconds = (date: DateUtils): SecondsEnum =>
  getValueHelper(date, (d) => d.getSeconds()) as SecondsEnum;

/**
 * @description Gets the seconds of a Date object using Universal Coordinated Time (UTC).
 * @returns a number from 0 to 999
 */
const getUTCSeconds = (date: DateUtils): SecondsEnum =>
  getValueHelper(date, (d) => d.getUTCSeconds()) as SecondsEnum;

/**
 * @description Gets the milliseconds of a Date, using local time.
 * @returns a number from 0 to 999
 */
const getLocaleMilliseconds = (date: DateUtils): MillisecondsEnum =>
  getValueHelper(date, (d) => d.getMilliseconds()) as MillisecondsEnum;

/**
 * @description Gets the milliseconds of a Date object using Universal Coordinated Time (UTC).
 * @returns a number from 0 to 999
 */
const getUTCMilliseconds = (date: DateUtils): MillisecondsEnum =>
  getValueHelper(date, (d) => d.getUTCMilliseconds()) as MillisecondsEnum;

/* set */

const setValueHelper =
  (setFn: (date: RawDateType) => void) =>
  (curr: DateUtils): DateUtils => {
    const copy = new Date(curr as RawDateType);
    setFn(copy);
    return copy;
  };

/** Sets the year of the Date object using local time. */
const setLocaleYear = (year: YearEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setFullYear(year);
  });

/** Sets the year value in the Date object using Universal Coordinated Time (UTC). */
const setUTCYear = (year: YearEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCFullYear(year);
  });

/** Sets the month value in the Date object using local time. */
const setLocaleMonth = (month: MonthEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setMonth((month - 1) as MonthIndexEnum);
  });

/** Sets the month value in the Date object using Universal Coordinated Time (UTC). */
const setUTCMonth = (month: MonthEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCMonth((month - 1) as MonthIndexEnum);
  });

/** Sets the numeric day-of-the-month value of the Date object using local time. */
const setLocaleDate = (date: DateEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setDate(date);
  });

/** ets the numeric day of the month in the Date object using Universal Coordinated Time (UTC). */
const setUTCDate = (date: DateEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCDate(date);
  });

/** Sets the hour value in the Date object using local time. */
const setLocaleHours = (hours: HoursEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setHours(hours);
  });

/** Sets the hours value in the Date object using Universal Coordinated Time (UTC). */
const setUTCHours = (hours: HoursEnum): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCHours(hours);
  });

/** Sets the minutes value in the Date object using local time. */
const setLocaleMinutes = (
  minutes: MinutesEnum
): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setMinutes(minutes);
  });

/** Sets the minutes value in the Date object using Universal Coordinated Time (UTC). */
const setUTCMinutes = (
  minutes: MinutesEnum
): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCMinutes(minutes);
  });

/** Sets the seconds value in the Date object using local time. */
const setLocaleSeconds = (
  seconds: SecondsEnum
): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setSeconds(seconds);
  });

/** Sets the seconds value in the Date object using Universal Coordinated Time (UTC). */
const setUTCSeconds = (
  seconds: SecondsEnum
): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCSeconds(seconds);
  });

/** Sets the milliseconds value in the Date object using local time. */
const setLocaleMilliseconds = (
  milliseconds: MillisecondsEnum
): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setMilliseconds(milliseconds);
  });

/** Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC). */
const setUTCMilliseconds = (
  milliseconds: MillisecondsEnum
): ((curr: DateUtils) => DateUtils) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCMilliseconds(milliseconds);
  });

/* update */

const updateLocaleYear =
  (updater: (year: YearEnum) => YearEnum) =>
  (curr: DateUtils): DateUtils =>
    setLocaleYear(updater(getLocaleYear(curr)))(curr);

const updateUTCYear =
  (updater: (year: YearEnum) => YearEnum) =>
  (curr: DateUtils): DateUtils =>
    setUTCYear(updater(getUTCYear(curr)))(curr);

const updateLocaleMonth =
  (updater: (month: MonthEnum) => MonthEnum) =>
  (curr: DateUtils): DateUtils =>
    setLocaleMonth(updater(getLocaleMonth(curr)))(curr);

const updateUTCMonth =
  (updater: (month: MonthEnum) => MonthEnum) =>
  (curr: DateUtils): DateUtils =>
    setUTCMonth(updater(getUTCMonth(curr)))(curr);

const updateLocaleDate =
  (updater: (date: DateEnum) => DateEnum) =>
  (curr: DateUtils): DateUtils =>
    setLocaleDate(updater(getLocaleDate(curr)))(curr);

const updateUTCDate =
  (updater: (date: DateEnum) => DateEnum) =>
  (curr: DateUtils): DateUtils =>
    setUTCDate(updater(getUTCDate(curr)))(curr);

const updateLocaleHours =
  (updater: (hour: HoursEnum) => HoursEnum) =>
  (curr: DateUtils): DateUtils =>
    setLocaleHours(updater(getLocaleHours(curr)))(curr);

const updateUTCHours =
  (updater: (hour: HoursEnum) => HoursEnum) =>
  (curr: DateUtils): DateUtils =>
    setUTCHours(updater(getUTCHours(curr)))(curr);

const updateLocaleMinutes =
  (updater: (minutes: MinutesEnum) => MinutesEnum) =>
  (curr: DateUtils): DateUtils =>
    setLocaleMinutes(updater(getLocaleMinutes(curr)))(curr);

const updateUTCMinutes =
  (updater: (minutes: MinutesEnum) => MinutesEnum) =>
  (curr: DateUtils): DateUtils =>
    setUTCMinutes(updater(getUTCMinutes(curr)))(curr);

const updateLocaleSeconds =
  (updater: (seconds: SecondsEnum) => SecondsEnum) =>
  (curr: DateUtils): DateUtils =>
    setLocaleSeconds(updater(getLocaleSeconds(curr)))(curr);

const updateUTCSeconds =
  (updater: (seconds: SecondsEnum) => SecondsEnum) =>
  (curr: DateUtils): DateUtils =>
    setUTCSeconds(updater(getUTCSeconds(curr)))(curr);

const updateLocaleMilliseconds =
  (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
  (curr: DateUtils): DateUtils =>
    setLocaleMilliseconds(updater(getLocaleMilliseconds(curr)))(curr);

const updateUTCMilliseconds =
  (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
  (curr: DateUtils): DateUtils =>
    setUTCMilliseconds(updater(getUTCMilliseconds(curr)))(curr);

/* create  */

const today = (): DateUtils => new Date();

const now = (): SafeUint => Date.now();

const create = (
  year: YearEnum,
  month: MonthEnum,
  date: DateEnum = 1,
  hours: HoursEnum = 0,
  minutes: MinutesEnum = 0,
  seconds: SecondsEnum = 0,
  ms: MillisecondsEnum = 0
): DateUtils =>
  new Date(
    year,
    (month - 1) as MonthIndexEnum,
    date,
    hours,
    minutes,
    seconds,
    ms
  );

const from = (value: RawDateType | number | string): DateUtils =>
  new Date(value);

/* timestamp */

/** Parses a string containing a date, and returns the number of milliseconds between that date and midnight, January 1, 1970. */
const parse = (str: string): SafeUint | undefined => {
  const res = Date.parse(str);
  return Number.isNaN(res) ? undefined : res;
};

/** Gets the time value in milliseconds. */
const toTimestamp = (d: DateUtils): SafeUint => d.getTime();

/* yesterday & tomorrow */

const getLocaleYesterday = updateLocaleDate((d) => (d - 1) as DateEnum);

const getLocaleTomorrow = updateLocaleDate((d) => (d + 1) as DateEnum);

/* convert */

const toMidnight = (date: DateUtils): DateUtils => {
  const mut_midnight = new Date(date as RawDateType);
  mut_midnight.setHours(0, 0, 0, 0);
  return mut_midnight;
};

const toDate = (date: DateUtils): RawDateType => date as RawDateType;

/**
 * ```
 * date1  <  date2 --> -1
 * date1  >  date2 -->  1
 * date1 === date2 -->  0
 * ```
 */
const cmp = (x: DateUtils, y: DateUtils): -1 | 0 | 1 => {
  const date1value = toTimestamp(x);
  const date2value = toTimestamp(y);

  if (date1value < date2value) return -1;
  if (date1value > date2value) return 1;

  return 0;
};

const isToday = (date: DateUtils): boolean => cmp(date, today()) === 0;

/** @description 何週目か(0-origin)を返す */
const weekNumberLocale = (date: DateUtils): 0 | 1 | 2 | 3 | 4 | 5 => {
  const date0Saturday =
    getLocaleDate(date) - 1 + (6 - getLocaleDayOfWeek(date)); // 同じ週の土曜日

  return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
};

/** @description 何週目か(0-origin)を返す */
const weekNumberUTC = (date: DateUtils): 0 | 1 | 2 | 3 | 4 | 5 => {
  const date0Saturday = getUTCDate(date) - 1 + (6 - getLocaleDayOfWeek(date)); // 同じ週の土曜日

  return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
};

/**
 * @description 引数の日が含まれる月の最終日(28-31)の数値を返す
 */
const getLastDateNumberOfMonth = (year: YearEnum, month: MonthEnum): DateEnum =>
  getLocaleDate(create(year, (month + 1) as MonthEnum, 0 as DateEnum));

const getAllDatesOfMonth = (
  year: YearEnum,
  month: MonthEnum
): readonly DateUtils[] =>
  Arr.range(1, Uint8.add(getLastDateNumberOfMonth(year, month), 1)).map(
    (date) => create(year, month, date as DateEnum)
  );

const numWeeksOfMonth = (
  year: YearEnum,
  month: MonthEnum
): 1 | 2 | 3 | 4 | 5 | 6 => {
  const lastDateNumber = getLastDateNumberOfMonth(year, month);
  const lastDate = setLocaleDate(lastDateNumber)(create(year, month));

  return (weekNumberLocale(lastDate) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
};

/* format */

const pad2 = (str: number): string => str.toString().padStart(2, '0');

const toLocaleYMD = (date: DateUtils, delimiter: string = '/'): string =>
  [
    getLocaleYear(date),
    pad2(getLocaleMonth(date)),
    pad2(getLocaleDate(date)),
  ].join(delimiter);

const toLocaleHM = (date: DateUtils, delimiter: string = ':'): string =>
  [pad2(getLocaleHours(date)), pad2(getLocaleMinutes(date))].join(delimiter);

const toLocaleHMS = (date: DateUtils, delimiter: string = ':'): string =>
  [
    pad2(getLocaleHours(date)),
    pad2(getLocaleMinutes(date)),
    pad2(getLocaleSeconds(date)),
  ].join(delimiter);

const toLocaleYMDHMS = (
  date: DateUtils,
  delimiterForYMD: string = '/',
  delimiterForHMS: string = ':'
): string =>
  [toLocaleYMD(date, delimiterForYMD), toLocaleHMS(date, delimiterForHMS)].join(
    ' '
  );

export const DateUtils = {
  getLocaleYear,
  getUTCYear,
  getLocaleMonth,
  getUTCMonth,
  getLocaleDate,
  getUTCDate,
  getLocaleDayOfWeek,
  getUTCDayOfWeek,
  getLocaleHours,
  getUTCHours,
  getLocaleMinutes,
  getUTCMinutes,
  getLocaleSeconds,
  getUTCSeconds,
  getLocaleMilliseconds,
  getUTCMilliseconds,
  setLocaleYear,
  setUTCYear,
  setLocaleMonth,
  setUTCMonth,
  setLocaleDate,
  setUTCDate,
  setLocaleHours,
  setUTCHours,
  setLocaleMinutes,
  setUTCMinutes,
  setLocaleSeconds,
  setUTCSeconds,
  setLocaleMilliseconds,
  setUTCMilliseconds,
  updateLocaleYear,
  updateUTCYear,
  updateLocaleMonth,
  updateUTCMonth,
  updateLocaleDate,
  updateUTCDate,
  updateLocaleHours,
  updateUTCHours,
  updateLocaleMinutes,
  updateUTCMinutes,
  updateLocaleSeconds,
  updateUTCSeconds,
  updateLocaleMilliseconds,
  updateUTCMilliseconds,
  today,
  now,
  create,
  from,
  parse,
  toTimestamp,
  getLocaleYesterday,
  getLocaleTomorrow,
  toMidnight,
  toDate,
  cmp,
  isToday,
  weekNumberLocale,
  weekNumberUTC,
  getLastDateNumberOfMonth,
  getAllDatesOfMonth,
  numWeeksOfMonth,
  toLocaleYMD,
  toLocaleHM,
  toLocaleHMS,
  toLocaleYMDHMS,
} as const;
