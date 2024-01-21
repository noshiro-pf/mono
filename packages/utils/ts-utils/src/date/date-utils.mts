import { Arr } from '../array/index.mjs';
import { Num } from '../num/index.mjs';

export type DateType = Omit<
  RawDateType,
  | typeof Symbol.toPrimitive
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
  | 'setTime'
  | 'setUTCDate'
  | 'setUTCFullYear'
  | 'setUTCHours'
  | 'setUTCMilliseconds'
  | 'setUTCMinutes'
  | 'setUTCMonth'
  | 'setUTCSeconds'
  | 'valueOf'
>;

/* get */

const getValueHelper = <N extends number>(
  date: DateType,
  getFn: (d: RawDateType) => N,
  // eslint-disable-next-line no-restricted-syntax
): N => getFn(date as RawDateType);

/** Gets the year, using local time. */
const getLocaleYear = (date: DateType): YearEnum =>
  getValueHelper(date, (d) => d.getFullYear()) satisfies YearEnum;

/** Gets the year using Universal Coordinated Time (UTC). */
const getUTCYear = (date: DateType): YearEnum =>
  getValueHelper(date, (d) => d.getUTCFullYear()) satisfies YearEnum;

/**
 * Gets the month, using local time.
 *
 * @returns A number from 1 to 12
 */
const getLocaleMonth = (date: DateType): MonthEnum =>
  getValueHelper(date, (d) => Num.increment(d.getMonth())) satisfies MonthEnum;

/**
 * Gets the month of a Date object using Universal Coordinated Time (UTC).
 *
 * @returns A number from 1 to 12
 */
const getUTCMonth = (date: DateType): MonthEnum =>
  getValueHelper(date, (d) =>
    Num.increment(d.getUTCMonth()),
  ) satisfies MonthEnum;

/**
 * Gets the day-of-the-month, using local time.
 *
 * @returns A number from 1 to 31
 */
const getLocaleDate = (date: DateType): DateEnum =>
  getValueHelper(date, (d) => d.getDate());

/**
 * Gets the day-of-the-month, using Universal Coordinated Time (UTC).
 *
 * @returns A number from 1 to 31
 */
const getUTCDate = (date: DateType): DateEnum =>
  getValueHelper(date, (d) => d.getUTCDate());

/**
 * Gets the day of the week, using local time.
 *
 * @returns A number from 0 to 6
 */
const getLocaleDayOfWeek = (date: DateType): DayOfWeekIndex =>
  getValueHelper(date, (d) => d.getDay());

/**
 * Gets the day of the week using Universal Coordinated Time (UTC).
 *
 * @returns A number from 0 to 6
 */
const getUTCDayOfWeek = (date: DateType): DayOfWeekIndex =>
  getValueHelper(date, (d) => d.getUTCDay());

/**
 * Gets the hours in a date, using local time.
 *
 * @returns A number from 0 to 23
 */
const getLocaleHours = (date: DateType): HoursEnum =>
  getValueHelper(date, (d) => d.getHours());

/**
 * Gets the hours value in a Date object using Universal Coordinated Time (UTC).
 *
 * @returns A number from 0 to 23
 */
const getUTCHours = (date: DateType): HoursEnum =>
  getValueHelper(date, (d) => d.getUTCHours());

/**
 * Gets the minutes of a Date object, using local time.
 *
 * @returns A number from 0 to 59
 */
const getLocaleMinutes = (date: DateType): MinutesEnum =>
  getValueHelper(date, (d) => d.getMinutes());

/**
 * Gets the minutes of a Date object using Universal Coordinated Time (UTC).
 *
 * @returns A number from 0 to 59
 */
const getUTCMinutes = (date: DateType): MinutesEnum =>
  getValueHelper(date, (d) => d.getUTCMinutes());

/**
 * Gets the seconds of a Date object, using local time.
 *
 * @returns A number from 0 to 59
 */
const getLocaleSeconds = (date: DateType): SecondsEnum =>
  getValueHelper(date, (d) => d.getSeconds());

/**
 * Gets the seconds of a Date object using Universal Coordinated Time (UTC).
 *
 * @returns A number from 0 to 999
 */
const getUTCSeconds = (date: DateType): SecondsEnum =>
  getValueHelper(date, (d) => d.getUTCSeconds());

/**
 * Gets the milliseconds of a Date, using local time.
 *
 * @returns A number from 0 to 999
 */
const getLocaleMilliseconds = (date: DateType): MillisecondsEnum =>
  getValueHelper(date, (d) => d.getMilliseconds());

/**
 * Gets the milliseconds of a Date object using Universal Coordinated Time
 * (UTC).
 *
 * @returns A number from 0 to 999
 */
const getUTCMilliseconds = (date: DateType): MillisecondsEnum =>
  getValueHelper(date, (d) => d.getUTCMilliseconds());

/* set */

const setValueHelper =
  (setFn: (date: RawDateType) => void) =>
  (curr: DateType): DateType => {
    const copy = new Date(curr.getTime());
    setFn(copy);
    return copy;
  };

/** Sets the year of the Date object using local time. */
const setLocaleYear = (year: YearEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setFullYear(year);
  });

/**
 * Sets the year value in the Date object using Universal Coordinated Time
 * (UTC).
 */
const setUTCYear = (year: YearEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCFullYear(year);
  });

/** Sets the month value in the Date object using local time. */
const setLocaleMonth = (month: MonthEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setMonth(Num.decrement(month) satisfies MonthIndexEnum);
  });

/**
 * Sets the month value in the Date object using Universal Coordinated Time
 * (UTC).
 */
const setUTCMonth = (month: MonthEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCMonth(Num.decrement(month) satisfies MonthIndexEnum);
  });

/** Sets the numeric day-of-the-month value of the Date object using local time. */
const setLocaleDate = (date: DateEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setDate(date);
  });

/**
 * Ets the numeric day of the month in the Date object using Universal
 * Coordinated Time (UTC).
 */
const setUTCDate = (date: DateEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCDate(date);
  });

/** Sets the hour value in the Date object using local time. */
const setLocaleHours = (hours: HoursEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setHours(hours);
  });

/**
 * Sets the hours value in the Date object using Universal Coordinated Time
 * (UTC).
 */
const setUTCHours = (hours: HoursEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCHours(hours);
  });

/** Sets the minutes value in the Date object using local time. */
const setLocaleMinutes = (
  minutes: MinutesEnum,
): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setMinutes(minutes);
  });

/**
 * Sets the minutes value in the Date object using Universal Coordinated Time
 * (UTC).
 */
const setUTCMinutes = (minutes: MinutesEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCMinutes(minutes);
  });

/** Sets the seconds value in the Date object using local time. */
const setLocaleSeconds = (
  seconds: SecondsEnum,
): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setSeconds(seconds);
  });

/**
 * Sets the seconds value in the Date object using Universal Coordinated Time
 * (UTC).
 */
const setUTCSeconds = (seconds: SecondsEnum): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCSeconds(seconds);
  });

/** Sets the milliseconds value in the Date object using local time. */
const setLocaleMilliseconds = (
  milliseconds: MillisecondsEnum,
): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setMilliseconds(milliseconds);
  });

/**
 * Sets the milliseconds value in the Date object using Universal Coordinated
 * Time (UTC).
 */
const setUTCMilliseconds = (
  milliseconds: MillisecondsEnum,
): ((curr: DateType) => DateType) =>
  setValueHelper((mut_copy) => {
    mut_copy.setUTCMilliseconds(milliseconds);
  });

/* update */

const updateLocaleYear =
  (updater: (year: YearEnum) => YearEnum) =>
  (curr: DateType): DateType =>
    setLocaleYear(updater(getLocaleYear(curr)))(curr);

const updateUTCYear =
  (updater: (year: YearEnum) => YearEnum) =>
  (curr: DateType): DateType =>
    setUTCYear(updater(getUTCYear(curr)))(curr);

const updateLocaleMonth =
  (updater: (month: MonthEnum) => MonthEnum) =>
  (curr: DateType): DateType =>
    setLocaleMonth(updater(getLocaleMonth(curr)))(curr);

const updateUTCMonth =
  (updater: (month: MonthEnum) => MonthEnum) =>
  (curr: DateType): DateType =>
    setUTCMonth(updater(getUTCMonth(curr)))(curr);

const updateLocaleDate =
  (updater: (date: DateEnum) => DateEnum) =>
  (curr: DateType): DateType =>
    setLocaleDate(updater(getLocaleDate(curr)))(curr);

const updateUTCDate =
  (updater: (date: DateEnum) => DateEnum) =>
  (curr: DateType): DateType =>
    setUTCDate(updater(getUTCDate(curr)))(curr);

const updateLocaleHours =
  (updater: (hour: HoursEnum) => HoursEnum) =>
  (curr: DateType): DateType =>
    setLocaleHours(updater(getLocaleHours(curr)))(curr);

const updateUTCHours =
  (updater: (hour: HoursEnum) => HoursEnum) =>
  (curr: DateType): DateType =>
    setUTCHours(updater(getUTCHours(curr)))(curr);

const updateLocaleMinutes =
  (updater: (minutes: MinutesEnum) => MinutesEnum) =>
  (curr: DateType): DateType =>
    setLocaleMinutes(updater(getLocaleMinutes(curr)))(curr);

const updateUTCMinutes =
  (updater: (minutes: MinutesEnum) => MinutesEnum) =>
  (curr: DateType): DateType =>
    setUTCMinutes(updater(getUTCMinutes(curr)))(curr);

const updateLocaleSeconds =
  (updater: (seconds: SecondsEnum) => SecondsEnum) =>
  (curr: DateType): DateType =>
    setLocaleSeconds(updater(getLocaleSeconds(curr)))(curr);

const updateUTCSeconds =
  (updater: (seconds: SecondsEnum) => SecondsEnum) =>
  (curr: DateType): DateType =>
    setUTCSeconds(updater(getUTCSeconds(curr)))(curr);

const updateLocaleMilliseconds =
  (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
  (curr: DateType): DateType =>
    setLocaleMilliseconds(updater(getLocaleMilliseconds(curr)))(curr);

const updateUTCMilliseconds =
  (updater: (milliseconds: MillisecondsEnum) => MillisecondsEnum) =>
  (curr: DateType): DateType =>
    setUTCMilliseconds(updater(getUTCMilliseconds(curr)))(curr);

/* create  */

const today = (): DateType => new Date();

const now = (): SafeUint => Date.now();

const create = (
  year: YearEnum,
  month: MonthEnum,
  date: DateEnum = 1,
  hours: HoursEnum = 0,
  minutes: MinutesEnum = 0,
  seconds: SecondsEnum = 0,
  ms: MillisecondsEnum = 0,
): DateType =>
  new Date(
    year,
    Num.decrement(month) satisfies MonthIndexEnum,
    date,
    hours,
    minutes,
    seconds,
    ms,
  );

const from = (value: RawDateType | number | string): DateType =>
  new Date(value);

/* timestamp */

/**
 * Parses a string containing a date, and returns the number of milliseconds
 * between that date and midnight, January 1, 1970.
 */
const parse = (str: string): SafeUint | undefined => {
  const res = Date.parse(str);
  return Number.isNaN(res) ? undefined : res;
};

/** Gets the time value in milliseconds. */
const toTimestamp = (d: DateType): SafeUint => d.getTime();

/* yesterday & tomorrow */

// eslint-disable-next-line no-restricted-syntax
const getLocaleYesterday = updateLocaleDate((d) => (d - 1) as DateEnum);

// eslint-disable-next-line no-restricted-syntax
const getLocaleTomorrow = updateLocaleDate((d) => (d + 1) as DateEnum);

/* convert */

const toMidnight = (date: DateType): DateType => {
  // eslint-disable-next-line no-restricted-syntax
  const mut_midnight = new Date(date as RawDateType);
  mut_midnight.setHours(0, 0, 0, 0);
  return mut_midnight;
};

// eslint-disable-next-line no-restricted-syntax
const toDate = (date: DateType): RawDateType => date as RawDateType;

/**
 * - `date1 < date2` --> `-1`
 * - `date1 > date2` --> `1`
 * - `date1 === date2` --> `0`
 */
const cmp = (x: DateType, y: DateType): -1 | 0 | 1 => {
  const date1value = toTimestamp(x);
  const date2value = toTimestamp(y);

  if (date1value < date2value) return -1;
  if (date1value > date2value) return 1;

  return 0;
};

const isToday = (date: DateType): boolean => cmp(date, today()) === 0;

/** 何週目か（0-origin）を返す */
const weekNumberLocale = (date: DateType): 0 | 1 | 2 | 3 | 4 | 5 => {
  const date0Saturday =
    getLocaleDate(date) - 1 + (6 - getLocaleDayOfWeek(date)); // 同じ週の土曜日

  // eslint-disable-next-line no-restricted-syntax
  return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
};

/** 何週目か（0-origin）を返す */
const weekNumberUTC = (date: DateType): 0 | 1 | 2 | 3 | 4 | 5 => {
  const date0Saturday = getUTCDate(date) - 1 + (6 - getLocaleDayOfWeek(date)); // 同じ週の土曜日

  // eslint-disable-next-line no-restricted-syntax
  return Math.floor(date0Saturday / 7) as 0 | 1 | 2 | 3 | 4 | 5;
};

/** 引数の日が含まれる月の最終日(28-31)の数値を返す */
const getLastDateNumberOfMonth = (year: YearEnum, month: MonthEnum): DateEnum =>
  // eslint-disable-next-line no-restricted-syntax
  getLocaleDate(create(year, (month + 1) as MonthEnum, 0 as DateEnum));

const getAllDatesOfMonth = (
  year: YearEnum,
  month: MonthEnum,
): readonly DateType[] =>
  Arr.range(1, Num.increment(getLastDateNumberOfMonth(year, month))).map(
    (date) => create(year, month, date),
  );

const numWeeksOfMonth = (
  year: YearEnum,
  month: MonthEnum,
): 1 | 2 | 3 | 4 | 5 | 6 => {
  const lastDateNumber = getLastDateNumberOfMonth(year, month);
  const lastDate = setLocaleDate(lastDateNumber)(create(year, month));

  return Num.increment(weekNumberLocale(lastDate));
};

/* format */

const pad2 = (str: number): string => str.toString().padStart(2, '0');

const toLocaleYMD = (date: DateType, delimiter: string = '/'): string =>
  [
    getLocaleYear(date),
    pad2(getLocaleMonth(date)),
    pad2(getLocaleDate(date)),
  ].join(delimiter);

const toLocaleHM = (date: DateType, delimiter: string = ':'): string =>
  [pad2(getLocaleHours(date)), pad2(getLocaleMinutes(date))].join(delimiter);

const toLocaleHMS = (date: DateType, delimiter: string = ':'): string =>
  [
    pad2(getLocaleHours(date)),
    pad2(getLocaleMinutes(date)),
    pad2(getLocaleSeconds(date)),
  ].join(delimiter);

const toLocaleYMDHMS = (
  date: DateType,
  delimiterForYMD: string = '/',
  delimiterForHMS: string = ':',
): string =>
  [toLocaleYMD(date, delimiterForYMD), toLocaleHMS(date, delimiterForHMS)].join(
    ' ',
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
