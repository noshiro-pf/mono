/**
 * How values are written on the page, in Japanese. Everything that depends on
 * the time zone takes it, so the tests can pin one; the page passes nothing
 * and gets the browser's.
 */

import type { ReadonlyRecord } from 'ts-type-forge';
import type {
  DependencyType,
  DisplayStatus,
  Priority,
  Progress,
} from '../domain/index.mjs';

export const MINUTE_MS = 60_000;

export const HOUR_MS = 3_600_000;

export const DAY_MS = 86_400_000;

export const progressLabels = {
  'not-started': '未着手',
  'in-progress': '作業中',
  'in-review': 'レビュー中',
  done: '完了',
} as const satisfies ReadonlyRecord<Progress, string>;

export const displayStatusLabels = {
  ready: '着手可',
  blocked: '待ち',
  'in-progress': '作業中',
  'in-review': 'レビュー中',
  done: '完了',
} as const satisfies ReadonlyRecord<DisplayStatus, string>;

export const priorityLabels = {
  1: '最高',
  2: '高',
  3: '中',
  4: '低',
  5: '最低',
} as const satisfies ReadonlyRecord<Priority, string>;

export const dependencyTypeLabels = {
  'finish-to-start': '完了後',
  'start-to-start': '開始後',
} as const satisfies ReadonlyRecord<DependencyType, string>;

/**
 * A lag as it is labelled on an edge: `+3日`, `+1日2時間`, `-5時間`, or
 * nothing when there is none. Rounded to the minute.
 */
export const formatLag = (lagMs: number): string => {
  const totalMinutes = Math.round(Math.abs(lagMs) / MINUTE_MS);

  if (totalMinutes === 0) {
    return '';
  }

  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);

  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR);

  const minutes = totalMinutes % MINUTES_PER_HOUR;

  const parts = [
    days === 0 ? ('' as const) : (`${days}日` as const),
    hours === 0 ? ('' as const) : (`${hours}時間` as const),
    minutes === 0 ? ('' as const) : (`${minutes}分` as const),
  ] as const;

  return `${lagMs < 0 ? '-' : '+'}${parts.join('')}`;
};

/** `2026/10/09 12:05`. */
export const formatDateTime = (epochMs: number, timeZone?: string): string =>
  dateTimeFormat(timeZone).format(epochMs);

/**
 * `10/09 12:05` within the year of `now`, and `2027/01/05` outside it — short
 * enough for the second line of a DAG node.
 */
export const formatShortDateTime = (
  epochMs: number,
  now: number,
  timeZone?: string,
): string =>
  (sameYear(epochMs, now, timeZone) ? monthDayTimeFormat : dateFormat)(
    timeZone,
  ).format(epochMs);

/** `2026/10/09`: an all-day date, with no time. */
export const formatDate = (epochMs: number, timeZone?: string): string =>
  dateFormat(timeZone).format(epochMs);

/**
 * `10/09` within the year of `now`, and `2026/10/09` outside it: an all-day
 * date as {@link formatShortDateTime} writes a time.
 */
export const formatShortDate = (
  epochMs: number,
  now: number,
  timeZone?: string,
): string =>
  (sameYear(epochMs, now, timeZone) ? monthDayFormat : dateFormat)(
    timeZone,
  ).format(epochMs);

/** A due date or a milestone's date: its day alone when it is all day. */
export const formatWhen = (
  epochMs: number,
  allDay: boolean,
  timeZone?: string,
): string =>
  allDay ? formatDate(epochMs, timeZone) : formatDateTime(epochMs, timeZone);

/** As {@link formatWhen}, short. */
export const formatShortWhen = (
  epochMs: number,
  allDay: boolean,
  now: number,
  timeZone?: string,
): string =>
  allDay
    ? formatShortDate(epochMs, now, timeZone)
    : formatShortDateTime(epochMs, now, timeZone);

/** `3時間`, `1.5時間`, or nothing without an estimate. */
export const formatEstimate = (hours: number | undefined): string =>
  hours === undefined ? '' : (`${hours}時間` as const);

const MINUTES_PER_HOUR = 60;

const MINUTES_PER_DAY = 1440;

const dateTimeFormat = (timeZone: string | undefined): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...(timeZone === undefined ? {} : { timeZone }),
  });

const monthDayTimeFormat = (
  timeZone: string | undefined,
): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...(timeZone === undefined ? {} : { timeZone }),
  });

const monthDayFormat = (timeZone: string | undefined): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    ...(timeZone === undefined ? {} : { timeZone }),
  });

const dateFormat = (timeZone: string | undefined): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(timeZone === undefined ? {} : { timeZone }),
  });

const yearFormat = (timeZone: string | undefined): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    ...(timeZone === undefined ? {} : { timeZone }),
  });

/** Whether `a` and `b` are in one year of `timeZone`'s calendar. */
const sameYear = (
  a: number,
  b: number,
  timeZone: string | undefined,
): boolean => {
  const year = yearFormat(timeZone);

  return year.format(a) === year.format(b);
};
