import { asNonZeroSafeInt, Num } from 'ts-data-forge';

/**
 * The epoch milliseconds of a time GitHub wrote (ISO 8601, `Z` or an offset:
 * a commit's date keeps its committer's), `NaN` for one that is not a time,
 * which {@link describeAge} and {@link formatLocalTime} then say is unknown.
 * Every time the page draws is read through here.
 */
export const instantMsOf = (text: string): number => Date.parse(text);

/**
 * `3 minutes ago`, from the largest unit that fits; the future is `just now`,
 * and a time that did not parse (`NaN`) is said to be unknown.
 */
export const describeAge = (epochMs: number, nowMs: number): string => {
  if (!Number.isFinite(epochMs)) {
    return 'at an unknown time';
  }

  const elapsed = nowMs - epochMs;

  const unit = UNITS.find(({ ms }) => elapsed >= ms);

  return unit === undefined
    ? 'just now'
    : `${countOf(Num.divInt(elapsed, unit.ms), unit.name)} ago`;
};

/** `1 minute 30 seconds`, `15 seconds`. */
export const describeInterval = (ms: number): string => {
  const seconds = Number.isFinite(ms) ? Math.max(0, Math.round(ms / 1000)) : 0;

  const minutes = Num.divInt(seconds, asNonZeroSafeInt(60));

  const rest = seconds % 60;

  return [
    ...(minutes > 0 ? [countOf(minutes, 'minute')] : []),
    ...(minutes === 0 || rest > 0 ? [countOf(rest, 'second')] : []),
  ].join(' ');
};

/** The reader's own date and time, to the second, with the zone. */
export const formatLocalTime = (epochMs: number): string =>
  Number.isFinite(epochMs) ? LOCAL_TIME.format(epochMs) : 'an unknown time';

/** The local time of day, `18:05` or `6:05 PM` as the reader's locale writes it. */
export const formatClockTime = (epochMs: number): string =>
  Number.isFinite(epochMs) ? CLOCK_TIME.format(epochMs) : '--:--';

/** `1 thing`, `2 things`. */
export const countOf = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}` as const;

const UNITS = [
  { name: 'day', ms: asNonZeroSafeInt(86_400_000) },
  { name: 'hour', ms: asNonZeroSafeInt(3_600_000) },
  { name: 'minute', ms: asNonZeroSafeInt(60_000) },
  { name: 'second', ms: asNonZeroSafeInt(1000) },
] as const;

const LOCAL_TIME = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'long',
});

const CLOCK_TIME = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });
