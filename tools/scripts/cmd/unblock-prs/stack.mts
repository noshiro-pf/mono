// cspell:ignore retarget retargeted

/**
 * Stacked pull requests: one whose base is another open pull request's
 * branch rather than the default branch. Which pull request is on which is
 * `pr-report-core`'s `stack.mts`, because the reports draw the same stacks;
 * what this script does about them is decided here.
 *
 * The life of a layer, and what this script does at each point:
 *
 * 1. **Stacked.** Its base is the layer below, so its diff is its own and its
 *    turn has not come: it is reported as waiting, and nothing else. It has
 *    no auto-merge, and must not: nothing holds a pull request onto an
 *    unprotected branch, so armed it would land in the layer below rather
 *    than on the default branch. Nothing arms it — `open-pr` arms nothing,
 *    and this script arms a pull request only when it picks it
 *    (`armOnPick` in `rebase.mts`), which a stacked one never is.
 * 2. **The layer below moves.** When this script rebases a pull request, it
 *    replays every layer stacked on it onto the new head with
 *    `git rebase --onto <new head> <old head>`, which carries exactly the
 *    layer's own commits. Otherwise each layer would show the old commits of
 *    the one below in its diff, and GitHub's own rebase, when that one
 *    merges, would start from a head the layer does not contain.
 * 3. **The layer below merges.** GitHub moves this one onto the default
 *    branch. From then on it is an ordinary pull request, picked and armed
 *    in its turn like any other, save one thing: it still carries the merged
 *    layer's commits, so its diff shows that layer's changes as its own. The
 *    next survey rebases them off with `--onto`, from the head that layer
 *    merged at to its squash commit, and carries the layers above along —
 *    without waiting for it to be queued, because that is an undoing of
 *    GitHub's move, not a turn: it adds nothing from the base, and needs no
 *    review to have finished. The ruleset merges a branch only when it is up
 *    to date and only by squash, so that commit's tree is the merged head's,
 *    and the rebased layer's tree is the one it had: only its history, and
 *    so its diff, changes. A queued layer is left to its own rebase when it
 *    is picked, which drops the same commits the same way on its way onto
 *    the tip.
 *
 * A stack here is made by the base alone. GitHub's native stacks are not
 * landed: GitHub refuses auto-merge on a pull request in one ("Auto-merge is
 * not supported for stacked pull requests"), and keeps a layer in its stack
 * after the one below has merged and it has been moved onto the default
 * branch — so one is reported rather than picked, and merged by hand.
 */

import { findStackParents } from 'pr-report-core';
import { isMergeQueued, isSkipCiLabelled, wantsAutoRebase } from './labels.mjs';
import { skipStillApplies } from './skips.mjs';
import type {
  BaseChange,
  Classification,
  NativeStackEntry,
  PullRequest,
  RetargetedLayer,
  SkipRecord,
  StackedOn,
  TriageContext,
} from './types.mjs';
import { isSafeRefName } from './util.mjs';
import { isVersionPullRequest } from './version-pr.mjs';

/**
 * The branch the pull request was stacked on, if the last change of its base
 * moved it off that branch and onto the default one.
 */
export const retargetedFrom = (
  changes: readonly BaseChange[],
  defaultBranch: string,
): string | undefined => {
  const last = changes.at(-1);

  return last?.to === defaultBranch && last.from !== defaultBranch
    ? last.from
    : undefined;
};

/** What to report for a stacked pull request in place of anything else. */
export const stackedNote = (
  pr: PullRequest,
  parent: number,
  context: TriageContext,
): Classification =>
  ({
    kind: 'note',
    note: `#${pr.number}: stacked on #${parent}, which merges first${
      context.cyclic.has(pr.number)
        ? ' — and on a cycle of stacks and Merge-After, so nothing here will move it'
        : ''
    }`,
  }) as const;

/**
 * What to report instead of picking a pull request in one of GitHub's native
 * stacks, which GitHub will not let this script arm; `undefined` for one in
 * none.
 */
export const nativeStackNote = (
  pr: PullRequest,
  entry: NativeStackEntry | undefined,
): Classification | undefined =>
  entry === undefined
    ? undefined
    : ({
        kind: 'note',
        note: `#${pr.number}: layer ${entry.position} of ${entry.size} of GitHub's native stack #${entry.stack}, on which GitHub refuses auto-merge; merge it by hand (a stack made by the base alone needs no native stack)`,
      } as const);

/**
 * Why a layer cannot be carried along when the one below it moves, or
 * `undefined` when it can. A fork's branch is not this repository's to push
 * to, whatever its name.
 */
export const restackable = (pr: PullRequest): string | undefined =>
  pr.state !== 'OPEN'
    ? (`it is ${pr.state}` as const)
    : pr.isCrossRepository
      ? 'its branch is in a fork'
      : !isSafeRefName(pr.headRefName)
        ? (`branch name ${JSON.stringify(pr.headRefName)} will not be passed to a shell` as const)
        : undefined;

/**
 * The pull requests this script rebases onto the default branch ahead of any
 * turn: the bottom layer of a stack, or a lone pull request, that asked for it
 * (`wantsAutoRebase`) and is paused by `skip-ci`, so the push costs no
 * matrix. Whether it is actually behind is for the caller to ask
 * git: `skip-ci` leaves the merge state at `BLOCKED` whatever the branch is.
 * The version pull request is the release workflow's, and one this script
 * already gave up on stays given up on until its head or the base moves.
 */
export const autoRebaseTargets = (
  pullRequests: readonly PullRequest[],
  defaultBranch: string,
  baseSha: string,
  skipped: ReadonlyMap<number, SkipRecord>,
): readonly PullRequest[] =>
  pullRequests.filter((pr) => {
    const skip = skipped.get(pr.number);

    return (
      pr.baseRefName === defaultBranch &&
      !pr.isDraft &&
      wantsAutoRebase(pr) &&
      isSkipCiLabelled(pr) &&
      !isVersionPullRequest(pr, defaultBranch) &&
      restackable(pr) === undefined &&
      (skip === undefined || !skipStillApplies(skip, pr, baseSha))
    );
  });

/** Which open pull request each stacked one is on: child → parent. */
export const stackParentsOf = (
  pullRequests: readonly PullRequest[],
  defaultBranch: string,
): ReadonlyMap<number, number> =>
  findStackParents(
    pullRequests.map((pr) => ({
      number: pr.number,
      headRef: pr.headRefName,
      baseRef: pr.baseRefName,
      fromFork: pr.isCrossRepository,
    })),
    defaultBranch,
  );

/**
 * What to remember of this survey's stacks for the next one: every layer, by
 * the branch it is on, and every layer remembered before that is still on
 * that branch. The second is a layer whose parent has merged while GitHub
 * has yet to move it — no open pull request heads its base any longer, so
 * the bases alone no longer say it is a layer, but it has still to come off
 * one.
 */
export const stackedOnAfter = (
  before: StackedOn | undefined,
  pullRequests: readonly PullRequest[],
  stackParents: ReadonlyMap<number, number>,
): StackedOn =>
  new Map(
    pullRequests
      .filter(
        (pr) =>
          stackParents.has(pr.number) ||
          before?.get(pr.number) === pr.baseRefName,
      )
      .map((pr) => [pr.number, pr.baseRefName] as const),
  );

/**
 * The pull requests the last survey saw stacked and this one sees on the
 * default branch — before the first survey, every pull request on the
 * default branch, whose timeline then says whether it came off a stack.
 *
 * A queued one is not among them: its own rebase, when it is picked, drops
 * the merged layer's commits on its way onto the tip. Nor is anything that
 * cannot be pushed to, or the version pull request, which was never a layer.
 */
export const retargetedLayers = (
  before: StackedOn | undefined,
  pullRequests: readonly PullRequest[],
  defaultBranch: string,
): readonly RetargetedLayer[] =>
  pullRequests
    .filter(
      (pr) =>
        pr.baseRefName === defaultBranch &&
        !isMergeQueued(pr) &&
        !isVersionPullRequest(pr, defaultBranch) &&
        restackable(pr) === undefined,
    )
    .flatMap((pr): readonly RetargetedLayer[] => {
      if (before === undefined) {
        return [{ pr, from: undefined }];
      }

      const from = before.get(pr.number);

      return from === undefined ? [] : [{ pr, from }];
    });
