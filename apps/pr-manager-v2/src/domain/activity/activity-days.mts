import { Arr, Num, Result } from 'ts-data-forge';

/**
 * The reader's days, as the Activity dialog counts by them (spec §5).
 *
 * **A day is the reader's own**: it runs from one local midnight to the next,
 * in the browser's time zone, because "how many merged on Tuesday" is about the
 * reader's Tuesday. A day daylight saving makes 23 or 25 hours long is still
 * one day: each bound is that date's midnight at the offset the zone has then.
 */
export type ActivityDay = Readonly<{
  /** `YYYY-MM-DD`, local, which names the day. */
  key: string;
  /** `10/11(日)`, as the table heads its row. */
  label: string;
  startMs: number;
  /** The next day's start. */
  endMs: number;
  /**
   * The day as a GitHub search range: both ends inclusive with their offsets,
   * so it ends on its last second.
   */
  range: string;
}>;

/** How many ended days the dialog counts. */
export const WEEK_LENGTH = 7;

/**
 * The {@link WEEK_LENGTH} days that ended before the day `nowMs` is in, oldest
 * first. They have ended, so their counts never change once read.
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

/** The day `nowMs` is in, whole: it is searched to its end. */
export const todayOf = (nowMs: number, timeZone?: string): ActivityDay =>
  dayOf(epochDayOf(nowMs, timeZone), timeZone);

/** The next local midnight after `nowMs`, when the week moves on. */
export const nextMidnightMs = (nowMs: number, timeZone?: string): number =>
  midnightOf(epochDayOf(nowMs, timeZone) + 1, timeZone);

/**
 * `ms` as `YYYY-MM-DDTHH:MM:SS+HH:MM` at `offsetMinutes` east of UTC, the form
 * a search qualifier takes a time in.
 */
export const isoWithOffset = (ms: number, offsetMinutes: number): string => {
  const wall = ms + offsetMinutes * MINUTE_MS;

  const day = Math.floor(wall / DAY_MS);

  const second = Math.floor((wall - day * DAY_MS) / SECOND_MS);

  const time = [
    Math.floor(second / 3600),
    Math.floor((second % 3600) / 60),
    second % 60,
  ]
    .map(pad)
    .join(':');

  const size = Math.abs(offsetMinutes);

  const sign = offsetMinutes < 0 ? '-' : '+';

  return `${keyOf(day)}T${time}${sign}${pad(Math.floor(size / 60))}:${pad(size % 60)}`;
};

/**
 * How many minutes east of UTC `timeZone` is at `ms`, read from the `GMT+09:00`
 * that `Intl` writes (`GMT` alone at UTC).
 */
export const offsetMinutesAt = (
  ms: number,
  timeZone: string | undefined,
): number => {
  const written =
    offsetFormat(timeZone)
      .formatToParts(ms)
      .find(({ type }) => type === 'timeZoneName')?.value ?? 'GMT';

  const matched = /^GMT([+-])(\d{2}):(\d{2})$/u.exec(written);

  if (matched === null) {
    return 0;
  }

  const [, sign, hours = '0', minutes = '0'] = matched;

  return (sign === '-' ? -1 : 1) * (numberOf(hours) * 60 + numberOf(minutes));
};

const SECOND_MS = 1000;

const MINUTE_MS = 60_000;

const DAY_MS = 86_400_000;

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

const numberOf = (digits: string): number =>
  Result.unwrapOkOr(Num.safeParseFloat(digits), 0);

const pad = (value: number): string => value.toString().padStart(2, '0');

const mut_offsetFormats = new Map<string, Intl.DateTimeFormat>();

const offsetFormat = (timeZone: string | undefined): Intl.DateTimeFormat => {
  const key = timeZone ?? '';

  const held = mut_offsetFormats.get(key);

  if (held !== undefined) {
    return held;
  }

  const made = new Intl.DateTimeFormat('en-US', {
    ...(timeZone === undefined ? {} : { timeZone }),
    timeZoneName: 'longOffset',
  });

  mut_offsetFormats.set(key, made);

  return made;
};

/** The date `ms` falls on in `timeZone`, as days since the epoch. */
const epochDayOf = (ms: number, timeZone: string | undefined): number =>
  Math.floor((ms + offsetMinutesAt(ms, timeZone) * MINUTE_MS) / DAY_MS);

/**
 * The first instant of `epochDay` in `timeZone`: midnight at the offset either
 * side of it, the earliest that falls on the day. Where a daylight-saving jump
 * skips midnight (00:00 → 01:00, as in Santiago), the day begins at 01:00;
 * where midnight comes twice, at the first.
 */
const midnightOf = (epochDay: number, timeZone: string | undefined): number => {
  const wall = epochDay * DAY_MS;

  const first = wall - offsetMinutesAt(wall, timeZone) * MINUTE_MS;

  const second = wall - offsetMinutesAt(first, timeZone) * MINUTE_MS;

  const onTheDay = [first, second].filter(
    (ms) => epochDayOf(ms, timeZone) === epochDay,
  );

  return Arr.isNonEmpty(onTheDay) ? Math.min(...onTheDay) : first;
};

const keyOf = (epochDay: number): string => {
  const date = new Date(epochDay * DAY_MS);

  return date.toISOString().slice(0, 10);
};

const labelOf = (epochDay: number): string => {
  const date = new Date(epochDay * DAY_MS);

  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}(${WEEKDAYS[date.getUTCDay() % 7]})`;
};

const dayOf = (epochDay: number, timeZone: string | undefined): ActivityDay => {
  const startMs = midnightOf(epochDay, timeZone);

  const endMs = midnightOf(epochDay + 1, timeZone);

  const lastMs = endMs - SECOND_MS;

  return {
    key: keyOf(epochDay),
    label: labelOf(epochDay),
    startMs,
    endMs,
    range: `${isoWithOffset(startMs, offsetMinutesAt(startMs, timeZone))}..${isoWithOffset(lastMs, offsetMinutesAt(lastMs, timeZone))}`,
  };
};
