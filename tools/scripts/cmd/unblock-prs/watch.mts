/** Polling one pull request until it merges, or until it will not. */

import { isRecord, Result } from 'ts-data-forge';
import {
  describeWaitingOn,
  isMergeableState,
  listRequiredChecks,
  summarizeChecks,
} from './checks.mjs';
import {
  BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP,
  GREEN_POLLS_BEFORE_GIVING_UP,
  MAX_CONSECUTIVE_POLL_ERRORS,
} from './constants.mjs';
import { viewPullRequest } from './github.mjs';
import { isSkipCiLabelled } from './labels.mjs';
import { type Options } from './options.mjs';
import { type PullRequest, type WatchOutcome } from './types.mjs';
import { log, pause, stopRequested } from './util.mjs';

/**
 * Polls one pull request until it merges or until something says it will not.
 * `expectedHead` is the commit the checks are expected on; a different head
 * means someone else pushed, and the survey has to start over.
 */
export const watch = async (
  pr: PullRequest,
  expectedHead: string,
  requiredContexts: readonly string[],
  options: Options,
): Promise<WatchOutcome> => {
  const deadline = Date.now() + options.watchTimeoutMin * 60_000;

  let mut_greenPolls = 0;

  let mut_errors = 0;

  while (!stopRequested()) {
    await pause(options.pollIntervalSec * 1000);

    if (stopRequested()) {
      break;
    }

    const viewed = await viewPullRequest(pr.number);

    if (Result.isErr(viewed)) {
      mut_errors += 1;

      log(`#${pr.number}: poll failed (${mut_errors}): ${viewed.value}`);

      if (mut_errors >= MAX_CONSECUTIVE_POLL_ERRORS) {
        return 'error';
      }

      continue;
    }

    const current = viewed.value;

    if (current.state === 'MERGED') {
      return 'merged';
    }

    if (current.state !== 'OPEN') {
      return 'closed';
    }

    if (!isRecord(current.autoMergeRequest)) {
      return 'auto-merge-disabled';
    }

    // The label skips every check workflow and leaves `no-skip-ci-label`
    // `pending`, so from here the checks can only sit there until the watch
    // times out. Stop now and let the survey set it aside.
    if (isSkipCiLabelled(current)) {
      return 'skip-ci-labelled';
    }

    if (current.headRefOid !== expectedHead) {
      return 'head-moved';
    }

    if (
      current.mergeStateStatus === 'BEHIND' ||
      current.mergeStateStatus === 'DIRTY'
    ) {
      return 'behind-again';
    }

    const checks = await listRequiredChecks(pr.number);

    if (Result.isErr(checks)) {
      mut_errors += 1;

      log(`#${pr.number}: poll failed (${mut_errors}): ${checks.value}`);

      if (mut_errors >= MAX_CONSECUTIVE_POLL_ERRORS) {
        return 'error';
      }

      continue;
    }

    mut_errors = 0;

    const summary = summarizeChecks(checks.value, requiredContexts);

    if (summary.status === 'failed') {
      log(`#${pr.number}: failed: ${summary.failed.join(', ')}`);

      return 'checks-failed';
    }

    if (summary.status === 'pending') {
      mut_greenPolls = 0;

      log(
        `#${pr.number}: ${current.mergeStateStatus}, waiting on ${describeWaitingOn(summary)}`,
      );
    } else {
      mut_greenPolls += 1;

      // GitHub calling it BLOCKED while every required context reads green is
      // the one combination that is usually transient, so it is given longer
      // than a pull request GitHub already considers mergeable.
      const budget = isMergeableState(current.mergeStateStatus)
        ? GREEN_POLLS_BEFORE_GIVING_UP
        : BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP;

      log(
        `#${pr.number}: ${current.mergeStateStatus}, all ${summary.total} required checks green (${mut_greenPolls}/${budget}), waiting for auto-merge`,
      );

      if (mut_greenPolls >= budget) {
        return 'not-merging';
      }
    }

    if (Date.now() > deadline) {
      log(
        `#${pr.number}: still waiting on ${describeWaitingOn(summary)} after ${options.watchTimeoutMin} minutes.`,
      );

      return 'timeout';
    }
  }

  return 'stopped';
};
