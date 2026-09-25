/**
 * What GitHub says is left of the GraphQL budget this page is spending.
 *
 * Worth showing rather than assuming: the budget belongs to the token's
 * account, not to the page, so whatever else that account does with GraphQL
 * — `gh` included — spends the same 5,000 points an hour, and a number on
 * screen is the difference between that and "the page is broken".
 *
 * GitHub names these headers in `Access-Control-Expose-Headers`, which is
 * what makes them readable from a page served somewhere else.
 */

import { Num, Result } from 'ts-data-forge';

export type RateLimit = Readonly<{
  /** Points left in the current window. */
  remaining: number;
  /** The size of the window: 5,000 points for a personal token. */
  limit: number;
  /** When the window refills, as epoch milliseconds. */
  resetEpochMs: number;
}>;

/**
 * Absent rather than guessed when GitHub says nothing, which is what a
 * response from a cache or a test double looks like. The page shows nothing
 * in that case instead of claiming a budget it has not been told about.
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

const MS_PER_SECOND = 1000;

const LOW = 0.25;

const readCount = (headers: Headers, header: string): number | undefined => {
  const raw = headers.get(header);

  if (raw === null) return undefined;

  const value = Result.unwrapOkOr(Num.safeParseInt(raw), Number.NaN);

  // `parseInt` answers `NaN` for a header that is present and not a number,
  // and this is a value the page does arithmetic with.
  return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
};
