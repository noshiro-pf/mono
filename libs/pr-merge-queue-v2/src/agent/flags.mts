/**
 * The flags `run-unblock-prs-skill` and `run-issue-resolver` read alike: the
 * pause between rounds and what a session may spend.
 */

import { Arr, Num, Result } from 'ts-data-forge';
import { positiveInteger } from '../cli/index.mjs';

/** `--interval-min` in minutes, `fallback` when absent, at most a day. */
export const parseIntervalMin = (
  raw: string | undefined,
  fallback: number,
): Result<number, string> => {
  const minutes = positiveInteger('interval-min', raw, fallback);

  return Result.isOk(minutes) && minutes.value > MAX_INTERVAL_MIN
    ? Result.err(
        `--interval-min must be at most ${MAX_INTERVAL_MIN} (a day), got ${minutes.value}`,
      )
    : minutes;
};

/**
 * A day. Past about 24 days the wait overflows `setTimeout`, which then fires
 * at once and turns the loop into a busy one; nothing needs a wait anywhere
 * near that long.
 */
export const MAX_INTERVAL_MIN = 24 * 60;

/**
 * `--max-budget-usd`. Required, because the alternative is an amount nobody
 * chose: a round that cannot settle a failure keeps going until something stops
 * it, and this is the only thing that does.
 */
export const parseMaxBudgetUsd = (
  raw: string | undefined,
): Result<number, string> =>
  raw === undefined
    ? Result.err(
        '--max-budget-usd is required: what one round may spend on the Claude API',
      )
    : parseUsd('max-budget-usd', raw);

/** `--<flag>`'s value as a positive amount in US dollars, written plainly. */
export const parseUsd = (flag: string, raw: string): Result<number, string> => {
  // A whole part and an optional fraction, read apart so that neither pattern
  // repeats inside another.
  const [whole = '', fraction, ...rest] = raw.split('.');

  const parsed =
    /^(?:0|[1-9]\d*)$/u.test(whole) &&
    (fraction === undefined || /^\d+$/u.test(fraction)) &&
    !Arr.isNonEmpty(rest)
      ? Result.unwrapOkOr(Num.safeParseFloat(raw), Number.NaN)
      : Number.NaN;

  return Number.isFinite(parsed) && Num.isNonZero(parsed)
    ? Result.ok(parsed)
    : Result.err(
        `--${flag} must be a positive amount in US dollars, got ${JSON.stringify(raw)}`,
      );
};
