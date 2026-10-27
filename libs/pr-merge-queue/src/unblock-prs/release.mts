/**
 * Keeping to one released pull request without touching any other.
 *
 * A pull request labelled `merge-queued` without `skip-ci` is released: a push
 * to it, or the label coming off, runs the full matrix. Only one of them can
 * merge before `main` moves and puts the rest back to `BEHIND`, so a second
 * released pull request is a matrix run to be thrown away.
 *
 * **This script puts `skip-ci` on a pull request only to give back the label
 * it has just taken off**, yielding to another released in the same moment,
 * and on no other pull request. It used to pause every other released one before releasing its own, which
 * labelled pull requests nobody had handed it — the dependency update the bot
 * opens released, one a person had just released on purpose. Now it keeps the
 * rule from its own side only: triage watches one already in flight rather
 * than picking another, and once its own is released it looks again, and when
 * another of its pull requests was released in the same moment and goes
 * first, it pauses its own ({@link yieldsTo}). A pull request someone else
 * releases runs, and what that costs is a matrix, not a wrong merge.
 *
 * "In the same moment" is the whole of it: only one the survey saw paused by
 * `skip-ci` is yielded to. One already released when the survey picked
 * `target` and not in flight — waiting on its declared order, held by its
 * review, conflicting, released by hand — is released on the next survey
 * too, which picks `target` again, so yielding to it took `skip-ci` off and
 * put it back on `target` for as long as the script ran.
 */

import { SKIP_CI_LABEL, type QueueOwner } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { log, type ApiContext } from '../lib/index.mjs';
import { addSkipCiLabel, listPullRequests } from './github.mjs';
import { isMergeQueued, isSkipCiLabelled, priorityRank } from './labels.mjs';
import type { PullRequest } from './types.mjs';
import { isVersionPullRequest } from './version-pr.mjs';

/**
 * Looks again once `target` has been released, and when another pull request
 * the worker owns was released in the same moment and goes first, pauses
 * `target` — the one pull request this may label. `pausedAtSurvey` is the
 * pull requests the survey that picked `target` saw labelled `skip-ci`.
 * Resolves to whether `target` keeps its release.
 */
export const settleAfterRelease = async (
  api: ApiContext,
  target: PullRequest,
  owners: ReadonlyMap<number, QueueOwner>,
  pausedAtSurvey: ReadonlySet<number>,
  defaultBranch: string,
): Promise<'kept' | 'yielded'> => {
  const listed = await listPullRequests(api);

  if (Result.isErr(listed)) {
    log(`Cannot list pull requests to check the release: ${listed.value}`);

    return 'kept';
  }

  const first = yieldsTo(
    target,
    listed.value,
    owners,
    pausedAtSurvey,
    defaultBranch,
  );

  if (first === undefined) {
    return 'kept';
  }

  const added = await addSkipCiLabel(api, target.number);

  log(
    Result.isErr(added)
      ? `#${target.number}: cannot put ${SKIP_CI_LABEL} back on it to let #${first.number} go first: ${added.value}`
      : `#${target.number}: put ${SKIP_CI_LABEL} back on it; #${first.number} was released in the same moment and goes first.`,
  );

  return Result.isErr(added) ? 'kept' : 'yielded';
};

/**
 * The pull request `target` should step back for, if any: another one the
 * worker owns, paused when the survey ran (`pausedAtSurvey`) and released
 * since, that goes first in {@link firstInReleaseOrder}. One set aside or
 * claimed is a skill's or a person's and runs nothing until its fix is
 * pushed, so it holds nothing back; counting it would stall the queue behind
 * a pull request nobody is about to run. One released before the survey is
 * not counted either: see the top of this file.
 */
export const yieldsTo = (
  target: PullRequest,
  pullRequests: readonly PullRequest[],
  owners: ReadonlyMap<number, QueueOwner>,
  pausedAtSurvey: ReadonlySet<number>,
  defaultBranch: string,
): PullRequest | undefined => {
  const others = releasedExcept(pullRequests, target.number).filter(
    (pr) =>
      owners.get(pr.number)?.owner === 'worker' &&
      pausedAtSurvey.has(pr.number),
  );

  const first = firstInReleaseOrder(
    Arr.toUnshifted(target)(others),
    defaultBranch,
  );

  return first === undefined || first.number === target.number
    ? undefined
    : first;
};

/**
 * The open pull requests labelled `merge-queued` without `skip-ci`, other
 * than `keep`. A draft, one without auto-merge and one on another base count
 * as well: each runs a matrix when pushed to, and whether it could merge
 * afterwards is a different question.
 */
export const releasedExcept = (
  pullRequests: readonly PullRequest[],
  keep: number | undefined,
): readonly PullRequest[] =>
  pullRequests.filter(
    (pr) =>
      pr.number !== keep &&
      pr.state === 'OPEN' &&
      isMergeQueued(pr) &&
      !isSkipCiLabelled(pr),
  );

/**
 * Which of several released pull requests keeps its release: `priority:high`
 * first and `priority:low` last, then the lowest number with the version pull
 * request last — the order candidates are picked in, so that the skill,
 * reading the same rule, settles it the same way.
 */
export const firstInReleaseOrder = (
  released: readonly PullRequest[],
  defaultBranch: string,
): PullRequest | undefined => {
  const rank = (pr: PullRequest): number =>
    priorityRank(pr) * 2 + (isVersionPullRequest(pr, defaultBranch) ? 1 : 0);

  const sorted = released.toSorted((a, b) =>
    rank(a) === rank(b) ? a.number - b.number : rank(a) - rank(b),
  );

  return Arr.isNonEmpty(sorted) ? sorted[0] : undefined;
};
