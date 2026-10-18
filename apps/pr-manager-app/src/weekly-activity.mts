/**
 * How many pull requests merged and how many issues closed on each of the
 * last seven days, for the dialog the header's "Activity" button opens.
 *
 * **A day is the reader's own**: it starts at midnight in the browser's time
 * zone, not in UTC, because "how many did I merge on Tuesday" is a question
 * about the reader's Tuesday. The seven are the days that have ended — up to
 * yesterday — so a count never changes once it is shown; the week moves on
 * at midnight, which is when the store reads it again (`activity-store.mts`).
 *
 * **Counted by GitHub's search** rather than by listing what merged and
 * closed: one `issueCount` per day and kind, fourteen aliased fields in one
 * query, so the cost is the same however busy the week was. A search
 * qualifier takes a time with an offset, which is what puts each day's
 * bounds at the reader's midnight. The merged section's list
 * (`MERGED_QUERY`) could not stand in for it: it looks through the last
 * thirty updated pull requests, which a busy week outruns.
 */

import { Arr, isRecord, Num, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { repositoryUrl, type ReportSource } from './constants.mjs';
import { askGraphql, type Answered, type Fetch } from './graphql.mjs';

/** How many days the dialog counts. */
export const WEEK_LENGTH = 7;

/** One of the reader's days. */
export type ActivityDay = Readonly<{
  /** `YYYY-MM-DD` in the reader's time zone, which is what identifies it. */
  key: string;
  /** Its first instant: midnight, local. */
  startMs: number;
  /** The first instant of the next day. */
  endMs: number;
  /** The day as a search qualifier's range, `<start>..<last second>`. */
  range: string;
}>;

export type ActivityKind = 'merged' | 'closed';

export type DayActivity = ActivityDay &
  Readonly<{ merged: number; closed: number }>;

export type WeeklyActivity = Readonly<{
  /** Oldest first, ending with yesterday. */
  days: readonly DayActivity[];
  /** The day the week was counted on, which it ends the day before. */
  countedOn: string;
}>;

/**
 * The {@link WEEK_LENGTH} days that ended before the day `nowMs` is in,
 * oldest first, in `timeZone` — the browser's own when it is left out.
 *
 * Each day is a calendar day rather than 24 hours back from the next: its
 * start is that date's midnight at the offset the zone had then, so a day
 * that daylight saving makes 23 or 25 hours long is still one day.
 */
export const weekBefore = (
  nowMs: number,
  timeZone?: string,
): readonly ActivityDay[] => {
  const today = epochDayOf(nowMs, timeZone);

  return Arr.seq(WEEK_LENGTH).map((index) =>
    dayOf(today - WEEK_LENGTH + index, timeZone),
  );
};

/** The `YYYY-MM-DD` of the day `nowMs` is in, in `timeZone`. */
export const dayKeyOf = (nowMs: number, timeZone?: string): string =>
  keyOf(epochDayOf(nowMs, timeZone));

/** The next midnight after `nowMs` in `timeZone`, when the week moves on. */
export const nextMidnightMs = (nowMs: number, timeZone?: string): number =>
  midnightOf(epochDayOf(nowMs, timeZone) + 1, timeZone);

/**
 * `ms` written as `YYYY-MM-DDTHH:MM:SS+HH:MM` at `offsetMinutes` east of
 * UTC — the form GitHub's search qualifiers take a time in.
 */
export const isoWithOffset = (ms: number, offsetMinutes: number): string => {
  const wall = ms + offsetMinutes * MINUTE_MS;

  const day = Math.floor(wall / DAY_MS);

  const secondOfDay = Math.floor((wall - day * DAY_MS) / SECOND_MS);

  const time = [
    Math.floor(secondOfDay / 3600),
    Math.floor((secondOfDay % 3600) / 60),
    secondOfDay % 60,
  ]
    .map(pad)
    .join(':');

  const offset = Math.abs(offsetMinutes);

  const zone =
    `${offsetMinutes < 0 ? '-' : '+'}${pad(Math.floor(offset / 60))}:${pad(offset % 60)}` as const;

  return `${keyOf(day)}T${time}${zone}`;
};

/**
 * The search that counts one kind on one day. Both ends are inclusive, so
 * the day runs to its last second rather than to the next midnight.
 */
export const activitySearch = (
  source: ReportSource,
  kind: ActivityKind,
  day: ActivityDay,
): string => {
  const { range } = day;

  return kind === 'merged'
    ? `repo:${source.owner}/${source.repo} is:pr is:merged merged:${range}`
    : `repo:${source.owner}/${source.repo} is:issue is:closed closed:${range}`;
};

/** The same search on GitHub, for a count a reader wants to see behind. */
export const activitySearchUrl = (
  source: ReportSource,
  kind: ActivityKind,
  day: ActivityDay,
): string => {
  // The `repo:` qualifier is the page's own.
  const qualifiers = activitySearch(source, kind, day).replace(/^\S+ /u, '');

  const params = new URLSearchParams({ q: qualifiers });

  return `${repositoryUrl(source)}/${kind === 'merged' ? 'pulls' : 'issues'}?${params.toString()}`;
};

/**
 * One query for the whole week: `merged_N` and `closed_N` for the `N`th day,
 * each a search asked only for its count. Every search string is a
 * variable, as a follow-up's values are (`report-query.mts`).
 */
export const weeklyActivityQuery = (
  source: ReportSource,
  days: readonly ActivityDay[],
): Readonly<{
  query: string;
  variables: ReadonlyRecord<string, string>;
}> => {
  const fields = days.flatMap((day, index) =>
    KINDS.map((kind) => ({
      alias: alias(kind, index),
      search: activitySearch(source, kind, day),
    })),
  );

  return {
    query: [
      `query WeeklyActivity(${fields.map(({ alias: field }) => `$${field}: String!`).join(', ')}) {`,
      // `first: 1` because a connection has to be given a size between 1
      // and 100; nothing of the node is asked for.
      ...fields.map(
        ({ alias: field }) =>
          `  ${field}: search(query: $${field}, type: ISSUE, first: 1) { issueCount }`,
      ),
      '}',
    ].join('\n'),
    variables: Object.fromEntries(
      fields.map(({ alias: field, search }) => [field, search] as const),
    ),
  };
};

export type WeeklyActivityRequest = Readonly<{
  token: string;
  nowMs: number;
  /** The browser's own when left out; a test names one. */
  timeZone?: string;
  fetchImpl?: Fetch;
}>;

/**
 * The week before the day `nowMs` is in, counted, or a sentence a reader can
 * act on. A count GitHub could not give fails the whole week: a day drawn
 * as `0` that was really unanswered would be read as a quiet day.
 */
export const loadWeeklyActivity = async (
  source: ReportSource,
  request: WeeklyActivityRequest,
): Promise<Answered<WeeklyActivity>> => {
  const { token, nowMs, timeZone, fetchImpl } = request;

  const days = weekBefore(nowMs, timeZone);

  const { query, variables } = weeklyActivityQuery(source, days);

  const answered = await askGraphql({
    query,
    variables,
    token,
    ...(fetchImpl === undefined ? {} : { fetchImpl }),
  });

  const { rateLimit } = answered;

  if (Result.isErr(answered.result)) {
    return { rateLimit, result: answered.result };
  }

  const { data, errors } = answered.result.value;

  if (Arr.isNonEmpty(errors)) {
    return {
      rateLimit,
      result: Result.err(
        `GitHub could not count the week: ${errors.map(({ message }) => message).join(' ')}`,
      ),
    };
  }

  const counted = days.map((day, index) => {
    const mergedCount = countAt(data, alias('merged', index));

    const closedCount = countAt(data, alias('closed', index));

    return mergedCount === undefined || closedCount === undefined
      ? undefined
      : { ...day, merged: mergedCount, closed: closedCount };
  });

  if (counted.includes(undefined)) {
    return {
      rateLimit,
      result: Result.err(
        'GitHub answered the week’s counts in a shape this page does not know.',
      ),
    };
  }

  return {
    rateLimit,
    result: Result.ok({
      days: counted.filter((day) => day !== undefined),
      countedOn: dayKeyOf(nowMs, timeZone),
    }),
  };
};

const KINDS = ['merged', 'closed'] as const satisfies readonly ActivityKind[];

const SECOND_MS = 1000;

const MINUTE_MS = 60_000;

const DAY_MS = 86_400_000;

const alias = (kind: ActivityKind, index: number): string =>
  `${kind}_${index}` as const;

const countAt = (data: unknown, key: string): number | undefined => {
  if (!isRecord(data)) {
    return undefined;
  }

  const field = data[key];

  if (!isRecord(field)) {
    return undefined;
  }

  const count = field['issueCount'];

  return typeof count === 'number' ? count : undefined;
};

/**
 * Days since the epoch, counted in `timeZone`: the date `ms` falls on there,
 * as one number that the days before and after are a subtraction from.
 */
const epochDayOf = (ms: number, timeZone: string | undefined): number =>
  Math.floor((ms + offsetMinutesAt(ms, timeZone) * MINUTE_MS) / DAY_MS);

/**
 * The first instant of `epochDay` in `timeZone`. The offset is read twice,
 * the second time at the answer the first gave, so a midnight on the far
 * side of a daylight-saving change gets the offset it actually has.
 */
const midnightOf = (epochDay: number, timeZone: string | undefined): number => {
  const wall = epochDay * DAY_MS;

  const guess = wall - offsetMinutesAt(wall, timeZone) * MINUTE_MS;

  return wall - offsetMinutesAt(guess, timeZone) * MINUTE_MS;
};

const dayOf = (epochDay: number, timeZone: string | undefined): ActivityDay => {
  const startMs = midnightOf(epochDay, timeZone);

  const endMs = midnightOf(epochDay + 1, timeZone);

  // Inclusive at both ends, so the day runs to its last second.
  const lastMs = endMs - SECOND_MS;

  return {
    key: keyOf(epochDay),
    startMs,
    endMs,
    range: `${isoWithOffset(startMs, offsetMinutesAt(startMs, timeZone))}..${isoWithOffset(lastMs, offsetMinutesAt(lastMs, timeZone))}`,
  };
};

/** `YYYY-MM-DD` of a day counted from the epoch. */
const keyOf = (epochDay: number): string => {
  const parts = UTC_DATE.formatToParts(epochDay * DAY_MS);

  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((found) => found.type === type)?.value ?? '';

  return `${part('year')}-${part('month')}-${part('day')}`;
};

/**
 * How many minutes east of UTC `timeZone` is at `ms`, from the
 * `GMT+09:00` that `Intl` writes for it — `GMT` alone at UTC itself.
 */
const offsetMinutesAt = (ms: number, timeZone: string | undefined): number => {
  const written =
    offsetFormat(timeZone)
      .formatToParts(ms)
      .find(({ type }) => type === 'timeZoneName')?.value ?? 'GMT';

  const matched = /^GMT([+-])(\d{2}):(\d{2})$/u.exec(written);

  if (matched === null) {
    return 0;
  }

  const [, sign = '+', hours = '0', minutes = '0'] = matched;

  return (
    (sign === '-' ? -1 : 1) *
    (Result.unwrapOkOr(Num.safeParseFloat(hours), Number.NaN) * 60 +
      Result.unwrapOkOr(Num.safeParseFloat(minutes), Number.NaN))
  );
};

/** A formatter that writes only the offset, made once for each zone. */
const offsetFormat = (timeZone: string | undefined): Intl.DateTimeFormat => {
  const key = timeZone ?? '';

  const held = mut_offsetFormats.get(key);

  if (held !== undefined) {
    return held;
  }

  const made = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'longOffset',
    ...(timeZone === undefined ? {} : { timeZone }),
  });

  mut_offsetFormats.set(key, made);

  return made;
};

const mut_offsetFormats = new Map<string, Intl.DateTimeFormat>();

const UTC_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'UTC',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const pad = (value: number): string => String(value).padStart(2, '0');
