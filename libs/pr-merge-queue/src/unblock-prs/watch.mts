/** Polling one pull request until it merges, or until it will not. */

import {
  isMergeableState,
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
  type ReviewHold,
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
import { addSkipCiLabel, viewPullRequest } from './github.mjs';
import { isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import { observeNotStarted, type NotStartedWait } from './not-started.mjs';
import type { Options } from './options.mjs';
import {
  describeFailedChecks,
  describeHold,
  describeNotStarted,
  describeTimeout,
} from './set-aside-detail.mjs';
import {
  codeOwnersClassification,
  readHoldAt,
  type HoldUnread,
  type ReviewContext,
} from './triage.mjs';
import type { ChecksSummary, PullRequest, Watched } from './types.mjs';
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
 * comment to say. Under a required check that enforces `CODEOWNERS`
 * (`codeOwnersCheck`), that check stays red on such a pull request, so the
 * watch ends `awaiting-bypass` once every other one is green
 * ({@link failingOutcome}).
 *
 * `reviewContext` is what the review of one that goes green and does not merge
 * is read with, to say what holds it.
 */
export const watch = async (
  api: ApiContext,
  pr: PullRequest,
  expectedHead: string,
  requiredContexts: readonly string[],
  options: Options,
  bypassReason: string | undefined,
  reviewContext: ReviewContext &
    Readonly<{ codeOwnersCheck: string | undefined }>,
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

    const checks = await readHeadChecks(api, pr.number, expectedHead);

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

    const failed =
      summary.verdict === 'failing'
        ? failingOutcome(summary, bypassReason, reviewContext.codeOwnersCheck)
        : undefined;

    if (failed !== undefined && failed !== 'wait') {
      log(
        `#${pr.number}: ${failed.outcome === 'checks-failed' ? (failed.detail ?? '') : 'every required check is green but the one that enforces CODEOWNERS; it waits for a bypass merge.'}`,
      );

      return failed;
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

    // Only the check a bypass merge passes over failed: waited for as pending,
    // under the same deadline.
    if (failed === 'wait' || summary.verdict === 'pending') {
      mut_greenPolls = 0;

      log(
        `#${pr.number}: ${current.mergeStateStatus}, ${failed === 'wait' ? `only ${reviewContext.codeOwnersCheck ?? 'the code-owner check'} failed, which a bypass merge passes over; ` : ''}waiting on ${describeWaitingOn(summary)}`,
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
        return endOfGreenWatch(
          current.mergeStateStatus,
          await readHoldAt(api, pr.number, expectedHead, reviewContext),
        );
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
 * What a failing summary ends the watch with: `checks-failed`, as for any pull
 * request; but for one only a bypass merges (`bypassReason`) whose only red is
 * the required check that enforces `CODEOWNERS` (`codeOwnersCheck`),
 * `awaiting-bypass` once every other check is green, and `wait` while they
 * still run, as triage decides for one up to date (`codeOwnersClassification`).
 */
export const failingOutcome = (
  summary: ChecksSummary,
  bypassReason: string | undefined,
  codeOwnersCheck: string | undefined,
): Watched | 'wait' => {
  const atCheckGate =
    bypassReason === undefined
      ? undefined
      : codeOwnersClassification(summary, codeOwnersCheck, {
          hold: { kind: 'bypass', reason: bypassReason },
          codeOwners: 'required',
        });

  return atCheckGate?.kind === 'awaiting-bypass'
    ? {
        outcome: 'awaiting-bypass',
        detail: `every required check is green but the one that enforces CODEOWNERS; ${atCheckGate.reason}`,
      }
    : atCheckGate?.kind === 'held'
      ? 'wait'
      : { outcome: 'checks-failed', ...describeFailedChecks(summary) };
};

/**
 * How a watch ends on a pull request green for its whole budget and not merged,
 * from what its review reads at the end.
 *
 * - **Held**: an owner's approval dismissed or a conversation opened during the
 *   watch. A review clears that without a push, so nothing is recorded: triage
 *   holds it, and lets it go as soon as the review changes. A `not-merging`
 *   record would keep it unpicked until the base moves, and last until a push.
 *   Only while GitHub says `BLOCKED`, the one state whose review triage reads
 *   on a pull request in flight: on any other it would be watched again, and
 *   again, with the queue behind it, so it is `not-merging`.
 * - **Only a bypass merges it**: what triage would have said, had its read not
 *   failed or been of another head.
 * - **Read at another head**: a push between the last poll and this read.
 * - **Otherwise** nothing here can say why, and it is `not-merging`.
 */
export const endOfGreenWatch = (
  mergeStateStatus: string,
  review: Result<ReviewHold | undefined, HoldUnread>,
): Watched => {
  if (Result.isErr(review)) {
    return review.value.otherHead
      ? { outcome: 'head-moved' }
      : {
          outcome: 'not-merging',
          detail: describeHold(
            mergeStateStatus,
            Result.err(review.value.message),
          ),
        };
  }

  return mergeStateStatus === 'BLOCKED' && review.value?.kind === 'held'
    ? { outcome: 'review-held', detail: review.value.reason }
    : review.value?.kind === 'bypass'
      ? {
          outcome: 'awaiting-bypass',
          detail: `every required check is green; ${review.value.reason}`,
        }
      : {
          outcome: 'not-merging',
          detail: describeHold(mergeStateStatus, review),
        };
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
