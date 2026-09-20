/** Turning the payload's numbers into what the page says. */

import { type PayloadComparison } from 'pr-report-payload';
import { asNonZeroSafeInt, Num } from 'ts-data-forge';

/**
 * `+3 / -12`: three commits of its own, twelve of the base it has not got.
 * The second number is the one that matters — the ruleset blocks a branch
 * that is behind, so anything but `-0` is a rebase waiting to happen.
 */
export const describeComparison = (
  comparison: PayloadComparison | null,
): string =>
  comparison === null
    ? 'ahead/behind unread'
    : `+${comparison.aheadBy} / -${comparison.behindBy}`;

/**
 * How long ago, in the largest unit that is still more than one.
 *
 * Both instants are milliseconds since the epoch — the report's own, carried
 * in the payload, and the browser's — so this is subtraction rather than
 * date parsing. `now` is a parameter so that the answer is a function of its
 * arguments: a report is only as useful as it is fresh, and the timestamp
 * alone does not say whether it is.
 */
export const describeAge = (epochMs: number, nowMs: number): string => {
  const elapsed = nowMs - epochMs;

  if (elapsed < 0) return 'just now';

  const unit = UNITS.find(({ millis }) => elapsed >= millis);

  if (unit === undefined) return 'just now';

  const amount = Num.divInt(elapsed, unit.millis);

  return `${amount} ${unit.name}${amount === 1 ? '' : 's'} ago`;
};

/** Largest first, so the first one that fits is the one to say. */
const UNITS = [
  { name: 'day', millis: asNonZeroSafeInt(86_400_000) },
  { name: 'hour', millis: asNonZeroSafeInt(3_600_000) },
  { name: 'minute', millis: asNonZeroSafeInt(60_000) },
] as const;
