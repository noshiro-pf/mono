/**
 * The clock, and instants written as the commands write them — through
 * `Date` rather than `Temporal`, which the oldest Node.js this package's
 * `engines` names has only behind a flag. GitHub's
 * timestamps are read with `pr-report-core`'s `epochMsOf`.
 */

/** Milliseconds since the epoch, now. */
export const currentEpochMs = (): number => Date.now();

/** An instant in UTC to the second, as GitHub writes one: `2026-09-29T01:02:03Z`. */
export const isoSeconds = (epochMs: number): string =>
  `${isoMillis(epochMs).slice(0, 19)}Z` as const;

/**
 * An instant in local time to the millisecond, with its offset from UTC:
 * `2026-09-27T21:03:04.500+09:00`. The offset is the machine's (`TZ`) at
 * that instant unless one is given, in minutes east of UTC.
 */
export const localTimestamp = (
  epochMs: number,
  offsetMinutes: number = machineOffsetMinutes(epochMs),
): string => {
  const local = isoMillis(epochMs + offsetMinutes * 60_000).slice(0, 23);

  const sign = offsetMinutes < 0 ? '-' : '+';

  const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    .toString()
    .padStart(2, '0');

  const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');

  return `${local}${sign}${hours}:${minutes}` as const;
};

/** `2026-09-27T12:03:04.500Z`. */
const isoMillis = (epochMs: number): string => {
  const date = new Date(epochMs);

  return date.toISOString();
};

/** The machine's (`TZ`) offset from UTC at an instant, in minutes east. */
const machineOffsetMinutes = (epochMs: number): number => {
  const date = new Date(epochMs);

  return -date.getTimezoneOffset();
};
