/** Polling one pull request until it merges, or until it will not. */

import { isRecord, Result } from 'ts-data-forge';
import {
  describeWaitingOn,
  isMergeableState,
  listRequiredChecks,
  listRunningChecks,
  summarizeChecks,
  type ReportedCheck,
} from './checks.mjs';
import {
  BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP,
  GREEN_POLLS_BEFORE_GIVING_UP,
  MAX_CONSECUTIVE_POLL_ERRORS,
} from './constants.mjs';
import { viewPullRequest, viewReviewDecision } from './github.mjs';
import { isSkipCiLabelled } from './labels.mjs';
import { type Options } from './options.mjs';
import {
  describeFailedChecks,
  describeHold,
  describeTimeout,
} from './set-aside-detail.mjs';
import { type PullRequest, type Watched } from './types.mjs';
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
): Promise<Watched> => {
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
        return { outcome: 'error' };
      }

      continue;
    }

    const current = viewed.value;

    if (current.state === 'MERGED') {
      return { outcome: 'merged' };
    }

    if (current.state !== 'OPEN') {
      return { outcome: 'closed' };
    }

    if (!isRecord(current.autoMergeRequest)) {
      return { outcome: 'auto-merge-disabled' };
    }

    // The label skips every check workflow and leaves `no-skip-ci-label`
    // `pending`, so from here the checks can only sit there until the watch
    // times out. Stop now and let the survey set it aside.
    if (isSkipCiLabelled(current)) {
      return { outcome: 'skip-ci-labelled' };
    }

    if (current.headRefOid !== expectedHead) {
      return { outcome: 'head-moved' };
    }

    if (
      current.mergeStateStatus === 'BEHIND' ||
      current.mergeStateStatus === 'DIRTY'
    ) {
      return { outcome: 'behind-again' };
    }

    const checks = await readChecks(pr.number);

    if (Result.isErr(checks)) {
      mut_errors += 1;

      log(`#${pr.number}: poll failed (${mut_errors}): ${checks.value}`);

      if (mut_errors >= MAX_CONSECUTIVE_POLL_ERRORS) {
        return { outcome: 'error' };
      }

      continue;
    }

    mut_errors = 0;

    const summary = summarizeChecks(
      checks.value.required,
      requiredContexts,
      checks.value.running,
    );

    if (summary.status === 'failed') {
      const failed = describeFailedChecks(summary);

      log(`#${pr.number}: ${failed.detail}`);

      return { outcome: 'checks-failed', ...failed };
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
        const reviewDecision = await viewReviewDecision(pr.number);

        return {
          outcome: 'not-merging',
          detail: describeHold(
            current.mergeStateStatus,
            Result.isOk(reviewDecision) ? reviewDecision.value : undefined,
          ),
        };
      }
    }

    if (Date.now() > deadline) {
      log(
        `#${pr.number}: still waiting on ${describeWaitingOn(summary)} after ${options.watchTimeoutMin} minutes.`,
      );

      return {
        outcome: 'timeout',
        detail: describeTimeout(summary, options.watchTimeoutMin),
      };
    }
  }

  return { outcome: 'stopped' };
};

/** The required checks and the names of every check still running. */
const readChecks = async (
  prNumber: number,
): Promise<
  Result<
    Readonly<{
      required: readonly ReportedCheck[];
      running: readonly string[];
    }>,
    string
  >
> => {
  const required = await listRequiredChecks(prNumber);

  if (Result.isErr(required)) {
    return required;
  }

  const running = await listRunningChecks(prNumber);

  return Result.isErr(running)
    ? running
    : Result.ok({ required: required.value, running: running.value });
};
