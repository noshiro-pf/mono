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
 * {@link CHECKS_NOT_STARTED_GRACE_MS} is first given one more label event:
 * `skip-ci` is put back on and taken off again (`refire`), which every check
 * workflow triggers on, and the wait starts over. The set-aside below clears
 * only when `main` moves, and when this is the one pull request the worker can
 * release, nothing else is about to move it (#3456). The label's own event
 * supersedes no verdict: the aggregates skip it while the label is on.
 *
 * Quiet for a second grace, it is set aside as `checks-not-started`, and the
 * next candidate is tried. `main` moving clears it: the rebase that follows is
 * a new head, and a new push GitHub starts the workflows for. It stays armed
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
 * One poll's step of the wait. `sinceEpochMs` is when the head was first seen
 * with {@link nothingStarted}, `undefined` before that, once anything ran, and
 * after a re-fire; `refired` says the re-fire has been spent, which it is once
 * per watch. `action` says what the poll does: wait on, re-fire the workflows,
 * or give up and set the pull request aside.
 */
export const observeNotStarted = (
  wait: NotStartedWait,
  summary: ChecksSummary,
  nowEpochMs: number,
): Readonly<{
  wait: NotStartedWait;
  action: 'give-up' | 'refire' | 'wait';
}> => {
  if (!nothingStarted(summary)) {
    return {
      wait: { sinceEpochMs: undefined, refired: wait.refired },
      action: 'wait',
    };
  }

  const since = wait.sinceEpochMs ?? nowEpochMs;

  if (nowEpochMs - since < CHECKS_NOT_STARTED_GRACE_MS) {
    return {
      wait: { sinceEpochMs: since, refired: wait.refired },
      action: 'wait',
    };
  }

  return wait.refired
    ? { wait: { sinceEpochMs: since, refired: true }, action: 'give-up' }
    : { wait: { sinceEpochMs: undefined, refired: true }, action: 'refire' };
};

export type NotStartedWait = Readonly<{
  sinceEpochMs: number | undefined;
  refired: boolean;
}>;
