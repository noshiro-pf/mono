/** Polling one pull request until it merges, or until it will not. */

import {
  isMergeableState,
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
} from 'pr-report-core';
import { isRecord, Result } from 'ts-data-forge';
import { log, removeLabel, type ApiContext } from '../lib/index.mjs';
import {
  describeWaitingOn,
  readHeadChecks,
  summarizeChecks,
} from './checks.mjs';
import {
  BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP,
  CHECKS_NOT_STARTED_GRACE_MS,
  GREEN_POLLS_BEFORE_GIVING_UP,
  MAX_CONSECUTIVE_POLL_ERRORS,
} from './constants.mjs';
import {
  addSkipCiLabel,
  viewPullRequest,
  viewReviewDecision,
} from './github.mjs';
import { isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import { observeNotStarted, type NotStartedWait } from './not-started.mjs';
import type { Options } from './options.mjs';
import {
  describeFailedChecks,
  describeHold,
  describeNotStarted,
  describeTimeout,
} from './set-aside-detail.mjs';
import type { PullRequest, Watched } from './types.mjs';
import { pause, stopRequested } from './util.mjs';

/**
 * Polls one pull request until it merges or until something says it will not.
 * `expectedHead` is the commit the checks are expected on; a different head
 * means someone else pushed, and the survey has to start over.
 *
 * `bypassReason` is set for a pull request only a ruleset bypass merges
 * (`pr-report-core`'s `review-hold.mts`). It has no auto-merge to lose, and
 * nothing will merge it on green, so the watch ends at the verdict: failed as
 * for any other, or green and `awaiting-bypass`, with the reason for the
 * comment to say.
 */
export const watch = async (
  api: ApiContext,
  pr: PullRequest,
  expectedHead: string,
  requiredContexts: readonly string[],
  options: Options,
  bypassReason: string | undefined,
): Promise<Watched> => {
  const deadline = Date.now() + options.watchTimeoutMin * 60_000;

  let mut_greenPolls = 0;

  let mut_notStarted: NotStartedWait = {
    sinceEpochMs: undefined,
    refired: false,
  };

  let mut_errors = 0;

  while (!stopRequested()) {
    await pause(options.pollIntervalSec * 1000);

    if (stopRequested()) {
      break;
    }

    const viewed = await viewPullRequest(api, pr.number);

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

    if (bypassReason === undefined && !isRecord(current.autoMergeRequest)) {
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

    const checks = await readHeadChecks(api, pr.number);

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

    if (summary.verdict === 'failing') {
      const failed = describeFailedChecks(summary);

      log(`#${pr.number}: ${failed.detail}`);

      return { outcome: 'checks-failed', ...failed };
    }

    const notStarted = observeNotStarted(mut_notStarted, summary, Date.now());

    mut_notStarted = notStarted.wait;

    // Not for one a person has taken out of the queue meanwhile: the label
    // event would start the matrix they asked to hold. The second grace sets it
    // aside instead.
    if (notStarted.action === 'refire' && !isMergeQueued(current)) {
      log(
        `#${pr.number}: nothing ran on its head, and ${MERGE_QUEUED_LABEL} is off it now, so the check workflows are not re-fired.`,
      );

      continue;
    }

    if (notStarted.action === 'refire') {
      log(
        `#${pr.number}: nothing ran on its head for ${CHECKS_NOT_STARTED_GRACE_MS / 60_000} min; putting ${SKIP_CI_LABEL} back on and taking it off, so that GitHub starts the check workflows again.`,
      );

      const refired = await refire(api, pr.number);

      if (Result.isErr(refired)) {
        // An add that failed leaves the head as it was, and the second grace
        // sets it aside; a removal that failed leaves the label on, which the
        // next poll reports as `skip-ci-labelled`.
        log(`#${pr.number}: could not re-fire the workflows: ${refired.value}`);
      }

      continue;
    }

    if (notStarted.action === 'give-up') {
      const detail = describeNotStarted(
        summary,
        CHECKS_NOT_STARTED_GRACE_MS / 60_000,
      );

      log(`#${pr.number}: ${detail}`);

      return { outcome: 'checks-not-started', detail };
    }

    if (summary.verdict === 'pending') {
      mut_greenPolls = 0;

      log(
        `#${pr.number}: ${current.mergeStateStatus}, waiting on ${describeWaitingOn(summary)}`,
      );
    } else if (bypassReason !== undefined) {
      log(
        `#${pr.number}: all ${summary.required} required checks green; it waits for a bypass merge.`,
      );

      return {
        outcome: 'awaiting-bypass',
        detail: `every required check is green; ${bypassReason}`,
      };
    } else {
      mut_greenPolls += 1;

      // GitHub calling it BLOCKED while every required context reads green is
      // the one combination that is usually transient, so it is given longer
      // than a pull request GitHub already considers mergeable.
      const budget = isMergeableState(current.mergeStateStatus)
        ? GREEN_POLLS_BEFORE_GIVING_UP
        : BLOCKED_GREEN_POLLS_BEFORE_GIVING_UP;

      log(
        `#${pr.number}: ${current.mergeStateStatus}, all ${summary.required} required checks green (${mut_greenPolls}/${budget}), waiting for auto-merge`,
      );

      if (mut_greenPolls >= budget) {
        const reviewDecision = await viewReviewDecision(api, pr.number);

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

/**
 * Puts `skip-ci` back on a released pull request and takes it off again, so
 * that its `unlabeled` event starts the check workflows GitHub did not start
 * for the head (`not-started.mts`).
 */
const refire = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<undefined, string>> => {
  const added = await addSkipCiLabel(api, prNumber);

  if (Result.isErr(added)) {
    return Result.err(`cannot add ${SKIP_CI_LABEL}: ${added.value}`);
  }

  const removed = await removeLabel(api, prNumber, SKIP_CI_LABEL);

  return Result.isErr(removed)
    ? Result.err(`cannot remove ${SKIP_CI_LABEL} again: ${removed.value}`)
    : Result.ok(undefined);
};
