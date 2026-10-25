import { Arr, asSafeInt, Num, Result } from 'ts-data-forge';

/**
 * 年月を「西暦 0 年 1 月からの通算月数」で表したもの。
 * スプレッドシートの各行（毎月 1 日の日付）に当たる。
 */
export type MonthIndex = number;

/** `YYYY-MM`（`<input type="month">` の値）を通算月数にする。読めなければ `undefined`。 */
export const parseYearMonth = (value: string): MonthIndex | undefined => {
  const match = /^(?<year>\d{4})-(?<month>\d{2})$/u.exec(value.trim());

  const year = match?.groups?.['year'];

  const month = match?.groups?.['month'];

  if (year === undefined || month === undefined) {
    return undefined;
  }

  const m = Result.unwrapOkOr(Num.safeParseInt(month), Number.NaN);

  return m < 1 || 12 < m
    ? undefined
    : Result.unwrapOkOr(Num.safeParseInt(year), Number.NaN) * 12 + m - 1;
};

/** `YYYY-MM` を通算月数にする。読めなければ `fallback`。 */
export const parseYearMonthOr = (
  value: string,
  fallback: MonthIndex,
): MonthIndex => parseYearMonth(value) ?? fallback;

/** 通算月数を `YYYY-MM` にする。 */
export const formatYearMonth = (index: MonthIndex): string =>
  `${yearOf(index)}-${String(monthOf(index)).padStart(2, '0')}` as const;

/** 通算月数の西暦年。 */
export const yearOf = (index: MonthIndex): number => Math.floor(index / 12);

/** 通算月数の月（1〜12）。 */
export const monthOf = (index: MonthIndex): number =>
  index - yearOf(index) * 12 + 1;

/** `index` の月の満年齢（誕生月の 1 日に 1 歳増える）。 */
export const ageAt = (index: MonthIndex, birth: MonthIndex): number =>
  Math.floor((index - birth) / 12);

/** `index` が誕生月か（満年齢が増える月か）。 */
export const isBirthdayMonth = (
  index: MonthIndex,
  birth: MonthIndex,
): boolean => (index - birth) % 12 === 0;

/** 満 `age` 歳になる月。 */
export const monthOfAge = (birth: MonthIndex, age: number): MonthIndex =>
  birth + Math.round(age * 12);

/**
 * 開始月が `start` 以下の要素のうち最後のもの（階段状に変わる値の参照）。
 * `entries` は開始月の昇順。どれも始まっていなければ `undefined`。
 */
export const findLatestStarted = <T extends Readonly<{ start: MonthIndex }>>(
  entries: readonly T[],
  index: MonthIndex,
): T | undefined => {
  let mut_found: T | undefined = undefined;

  for (const entry of entries) {
    if (entry.start > index) {
      break;
    }

    mut_found = entry;
  }

  return mut_found;
};

/** 開始月の昇順に並べる（同じ月なら元の順）。 */
export const sortByStart = <T extends Readonly<{ start: MonthIndex }>>(
  entries: readonly T[],
): readonly T[] => Arr.toSorted(entries, (a, b) => a.start - b.start);

/** `start` 以上 `end` 未満の整数（端数は切り捨てる）。 */
export const integerRange = (start: number, end: number): readonly number[] =>
  Arr.range(asSafeInt(Math.floor(start)), asSafeInt(Math.floor(end)));

/** 月ごとの行に満年齢を付ける（表示用）。 */
export const withAge = <R extends Readonly<{ month: MonthIndex }>>(
  rows: readonly R[],
  birth: MonthIndex,
): readonly (R & Readonly<{ age: number }>)[] =>
  rows.map((row) => ({ ...row, age: ageAt(row.month, birth) }));
