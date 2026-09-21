/**
 * What GitHub says is left of the budget this page is spending.
 *
 * Worth showing rather than assuming, for two reasons. The anonymous budget
 * belongs to the address rather than to the page, so a reader behind an
 * office or a university address can arrive at a page that is already out of
 * requests through no act of their own, and a number on screen is the
 * difference between that and "the report is broken". And it is how a reader
 * sees that a token they pasted is being accepted: the limit goes from 60 to
 * 5,000 the moment GitHub accepts it, which no other part of the page would
 * show.
 *
 * The headers arrive on every answer including a `304` — GitHub names them
 * in `Access-Control-Expose-Headers` on that answer too, which is what makes
 * them readable from a page served somewhere else.
 */

import { Num, Result } from 'ts-data-forge';

export type RateLimit = Readonly<{
  /** Requests left in the current window. */
  remaining: number;
  /** The size of the window: 60 without a token, 5,000 with one. */
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
 * A fraction rather than a count, so that the same test reads correctly for
 * both windows: a quarter of 60 is a reader who has minutes left, and a
 * quarter of 5,000 is a reader who has a problem somewhere else.
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
