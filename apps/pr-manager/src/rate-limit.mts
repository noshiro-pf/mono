/**
 * What GitHub says is left of the GraphQL budget this page is spending.
 *
 * Worth showing rather than assuming: the budget belongs to the token's
 * account, not to the page, so whatever else that account does with GraphQL —
 * `gh` included — spends the same 5,000 points an hour, and a number on screen
 * is the difference between that and "the page is broken".
 *
 * GitHub names these headers in `Access-Control-Expose-Headers`, which is what
 * makes them readable from a page served somewhere else.
 */

import { Num, Result } from 'ts-data-forge';
import { POLL_INTERVAL_MS } from './constants.mjs';

export type RateLimit = Readonly<{
  /** Points left in the current window. */
  remaining: number;
  /** The size of the window: 5,000 points for a personal token. */
  limit: number;
  /** When the window refills, as epoch milliseconds. */
  resetEpochMs: number;
}>;

/**
 * Absent rather than guessed when GitHub says nothing, which is what a response
 * from a cache or a test double looks like. The page shows nothing in that case
 * instead of claiming a budget it has not been told about.
 */
export const readRateLimit = (headers: Headers): RateLimit | undefined => {
  const remaining = readCount(headers, 'x-ratelimit-remaining');

  const limit = readCount(headers, 'x-ratelimit-limit');

  const resetSeconds = readCount(headers, 'x-ratelimit-reset');

  return remaining === undefined ||
    limit === undefined ||
    resetSeconds === undefined
    ? undefined
    : { remaining, limit, resetEpochMs: resetSeconds * MS_PER_SECOND };
};

/**
 * Whether the budget has fallen far enough to be worth saying out loud.
 *
 * A fraction rather than a count, so that the test reads correctly whatever
 * size of window GitHub gives the account.
 */
export const isRunningLow = (rateLimit: RateLimit): boolean =>
  rateLimit.remaining <= rateLimit.limit * LOW;

/** The budget as it stood at an instant, for {@link pollIntervalFor}. */
export type BudgetSample = Readonly<{ rateLimit: RateLimit; atMs: number }>;

/**
 * How often to read so that the page spends about half of the account's budget
 * — what reading every {@link POLL_INTERVAL_MS} spends on this repository —
 * measured by what the budget went down by between two reads:
 * a larger repository costs more a read, and is read less often rather than
 * spending the whole budget, never less often than
 * {@link MAX_POLL_INTERVAL_MS}. Anything else the account spends in between
 * counts too, which slows the page rather than the account's other work.
 *
 * The interval it has, when the two say nothing about the cost: no read before,
 * a window that refilled in between, or no time between them.
 */
export const pollIntervalFor = ({
  intervalMs,
  previous,
  current,
}: Readonly<{
  intervalMs: number;
  previous: BudgetSample | undefined;
  current: BudgetSample;
}>): number => {
  if (
    previous?.rateLimit.resetEpochMs !== current.rateLimit.resetEpochMs ||
    current.atMs <= previous.atMs
  ) {
    return intervalMs;
  }

  const elapsedMs = current.atMs - previous.atMs;

  const allowedPerHour = current.rateLimit.limit * POLL_BUDGET_SHARE;

  if (!Num.isNonZero(elapsedMs) || !Num.isNonZero(allowedPerHour)) {
    return intervalMs;
  }

  const spent = Math.max(
    0,
    previous.rateLimit.remaining - current.rateLimit.remaining,
  );

  // What one read costs, over what an hour allows, is the share of an hour a
  // read has to be apart from the next.
  const wantedMs = Num.div(
    Num.div(spent * intervalMs, elapsedMs) * MS_PER_HOUR,
    allowedPerHour,
  );

  const wanted =
    Math.ceil(wantedMs / POLL_INTERVAL_STEP_MS) * POLL_INTERVAL_STEP_MS;

  return Math.min(MAX_POLL_INTERVAL_MS, Math.max(POLL_INTERVAL_MS, wanted));
};

/** Five minutes: past that, the page has stopped being current. */
export const MAX_POLL_INTERVAL_MS = 300_000;

/** The share of the budget the page's reads may spend. */
const POLL_BUDGET_SHARE = 0.5;

/** Intervals in steps of five seconds, so that noise does not move them. */
const POLL_INTERVAL_STEP_MS = 5000;

const MS_PER_HOUR = 3_600_000;

const MS_PER_SECOND = 1000;

const LOW = 0.25;

const readCount = (headers: Headers, header: string): number | undefined => {
  const raw = headers.get(header);

  if (raw === null) {
    return undefined;
  }

  const value = Result.unwrapOkOr(Num.safeParseInt(raw), Number.NaN);

  // `parseInt` answers `NaN` for a header that is present and not a number, and
  // this is a value the page does arithmetic with.
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
};
