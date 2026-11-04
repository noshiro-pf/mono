/**
 * A watched pull request on whose head GitHub never started some of the check
 * workflows a required context comes from.
 *
 * Releasing a pull request takes `skip-ci` off its rebased head, and that label
 * event starts every check workflow. Sometimes GitHub starts none of them: the
 * `pull_request_target` workflows run, `no-skip-ci-label` turns green, and the
 * `pull_request` ones never appear, so the required aggregates never report and
 * nothing on the head runs (#3263). Without this the watch waits for
 * `--watch-timeout`, and the queue behind it with it.
 *
 * So a head with required contexts unreported and nothing running for
 * {@link CHECKS_NOT_STARTED_GRACE_MS} is set aside as `checks-not-started`, and
 * the next candidate is tried. `main` moving clears it: the rebase that follows
 * is a new head, and a new push GitHub starts the workflows for. It stays armed
 * and released, so runs GitHub only delayed still merge it on green, beside
 * whatever was released after it.
 */

import { Arr } from 'ts-data-forge';
import { CHECKS_NOT_STARTED_GRACE_MS } from './constants.mjs';
import type { ChecksSummary } from './types.mjs';

/**
 * Whether the head shows no round at all: a required context unreported, and no
 * check on the head running or pending.
 */
export const nothingStarted = (summary: ChecksSummary): boolean =>
  summary.verdict === 'pending' &&
  Arr.isNonEmpty(summary.missing) &&
  !Arr.isNonEmpty(summary.pending) &&
  !Arr.isNonEmpty(summary.running);

/**
 * One poll's step of the wait: `sinceEpochMs` is when the head was first seen
 * with {@link nothingStarted}, `undefined` before that or once anything ran,
 * and `gaveUp` says the grace has run out.
 */
export const observeNotStarted = (
  sinceEpochMs: number | undefined,
  summary: ChecksSummary,
  nowEpochMs: number,
): Readonly<{ sinceEpochMs: number | undefined; gaveUp: boolean }> => {
  if (!nothingStarted(summary)) {
    return { sinceEpochMs: undefined, gaveUp: false };
  }

  const since = sinceEpochMs ?? nowEpochMs;

  return {
    sinceEpochMs: since,
    gaveUp: nowEpochMs - since >= CHECKS_NOT_STARTED_GRACE_MS,
  };
};
