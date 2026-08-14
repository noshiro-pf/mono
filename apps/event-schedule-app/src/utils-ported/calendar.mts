import {
  type MutableRecord,
  type ReadonlyRecord,
  type StrictOmit,
} from 'ts-type-forge';

/**
 * Month and weekday names.
 *
 * Ported from `@noshiro/ts-utils-additional`; `ts-data-forge` has no successor.
 * Only the two shapes this app reads are kept: a list of months with their
 * numbers, and the weekdays in `Date.prototype.getDay` order.
 */
export const monthsList = {
  en: [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ],
  jp: [
    { value: 1, name: '1月' },
    { value: 2, name: '2月' },
    { value: 3, name: '3月' },
    { value: 4, name: '4月' },
    { value: 5, name: '5月' },
    { value: 6, name: '6月' },
    { value: 7, name: '7月' },
    { value: 8, name: '8月' },
    { value: 9, name: '9月' },
    { value: 10, name: '10月' },
    { value: 11, name: '11月' },
    { value: 12, name: '12月' },
  ],
} as const;

export const daysOfWeekList = {
  en: [
    { name: 'Sunday', abbr: 'Su' },
    { name: 'Monday', abbr: 'Mo' },
    { name: 'Tuesday', abbr: 'Tu' },
    { name: 'Wednesday', abbr: 'We' },
    { name: 'Thursday', abbr: 'Th' },
    { name: 'Friday', abbr: 'Fr' },
    { name: 'Saturday', abbr: 'Sa' },
  ],
  jp: [
    { name: '日曜日', abbr: '日' },
    { name: '月曜日', abbr: '月' },
    { name: '火曜日', abbr: '火' },
    { name: '水曜日', abbr: '水' },
    { name: '木曜日', abbr: '木' },
    { name: '金曜日', abbr: '金' },
    { name: '土曜日', abbr: '土' },
  ],
} as const;

export const daysOfWeek = {
  en: {
    Sun: { name: 'Sunday', abbr: 'Su' },
    Mon: { name: 'Monday', abbr: 'Mo' },
    Tue: { name: 'Tuesday', abbr: 'Tu' },
    Wed: { name: 'Wednesday', abbr: 'We' },
    Thr: { name: 'Thursday', abbr: 'Th' },
    Fri: { name: 'Friday', abbr: 'Fr' },
    Sat: { name: 'Saturday', abbr: 'Sa' },
  },
  jp: {
    Sun: { name: '日曜日', abbr: '日' },
    Mon: { name: '月曜日', abbr: '月' },
    Tue: { name: '火曜日', abbr: '火' },
    Wed: { name: '水曜日', abbr: '水' },
    Thr: { name: '木曜日', abbr: '木' },
    Fri: { name: '金曜日', abbr: '金' },
    Sat: { name: '土曜日', abbr: '土' },
  },
} as const;

/** Whether the string looks like an email address. */
export const isEmailString = (str: string): boolean =>
  // eslint-disable-next-line require-unicode-regexp, security/detect-unsafe-regex, no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    str,
  );

/** The identity function. */
export const idfn = <T,>(value: T): T => value;

/** What `setTimeout` returns and `clearTimeout` takes. */
export type TimerId = Parameters<typeof clearTimeout>[0];

/** A function whose input and output are the same type. */
export type MonoTypeFunction<T> = (value: T) => T;

/**
 * Resolves a relative path against the current document.
 *
 * Ported from `@noshiro/ts-utils-additional`; `ts-data-forge` has no successor.
 * The anchor element does the resolving, which is what the original relied on.
 */
export const toAbsolutePath = (relativePath: string): string => {
  const mut_element = document.createElement('a');

  mut_element.href = relativePath;

  return mut_element.href;
};

/** Sorts a tuple without mutating it, keeping its length in the type. */
export const sortedTuple = <const T extends readonly unknown[]>(
  tuple: T,
  comparator: (a: T[number], b: T[number]) => number,
): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  tuple.toSorted(comparator) as unknown as T;

/** A copy of `record` without the listed keys. */
export const omitKeys = <
  const R extends ReadonlyRecord<string, unknown>,
  const Keys extends readonly (keyof R & string)[],
>(
  record: R,
  keys: Keys,
): StrictOmit<R, Keys[number]> => {
  const mut_result: MutableRecord<string, unknown> = { ...record };

  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete mut_result[key];
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return mut_result as StrictOmit<R, Keys[number]>;
};
