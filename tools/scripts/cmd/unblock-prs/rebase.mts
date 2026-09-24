// cspell:ignore unlabel unlabelling

/**
 * Moving a branch: onto the tip of the base, and out from under `skip-ci`.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { git, viewPullRequest } from './github.mjs';
import { isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import {
  type Advanced,
  type PullRequest,
  type RebaseFailure,
} from './types.mjs';
import { lastLines, sh } from './util.mjs';
import { isVersionPullRequest } from './version-pr.mjs';

/**
 * Rebases the pull request's branch onto `origin/<defaultBranch>` in a
 * throwaway worktree and force-pushes the result, expecting the remote branch
 * to still be at the head the survey saw. Resolves to the new head.
 *
 * The worktree is detached, so the checkout this runs from is never touched,
 * and it is removed on the way out of every path: the work inside it is a
 * function of its own, and this one removes the worktree after it returns
 * however it returned. A process killed mid-rebase leaves one behind, which
 * is what the `removeWorktree` before `git worktree add` is for.
 */
const rebaseAndPush = async (
  pr: PullRequest,
  defaultBranch: string,
): Promise<Result<string, RebaseFailure>> => {
  const branch = pr.headRefName;

  const worktreeDir = path.join(os.tmpdir(), 'unblock-prs', `pr-${pr.number}`);

  const rebaseFailed = (detail: string): Result<string, RebaseFailure> =>
    Result.err({ reason: 'rebase-failed', detail });

  // A previous run may have been interrupted with this worktree in place.
  await removeWorktree(worktreeDir);

  const fetched = await git(
    `git fetch --quiet origin ${sh(defaultBranch)} ${sh(branch)}`,
  );

  if (Result.isErr(fetched)) {
    return rebaseFailed(`fetch failed: ${fetched.value}`);
  }

  const remoteHead = await git(`git rev-parse ${sh(`origin/${branch}`)}`);

  if (Result.isErr(remoteHead)) {
    return rebaseFailed(`cannot resolve origin/${branch}: ${remoteHead.value}`);
  }

  if (remoteHead.value.trim() !== pr.headRefOid) {
    return rebaseFailed(
      `origin/${branch} moved since the survey (${remoteHead.value.trim().slice(0, 10)} != ${pr.headRefOid.slice(0, 10)}).`,
    );
  }

  const added = await git(
    `git worktree add --detach ${sh(worktreeDir)} ${sh(pr.headRefOid)}`,
  );

  if (Result.isErr(added)) {
    return rebaseFailed(`checkout failed: ${added.value}`);
  }

  const result = await rebaseInWorktree(pr, defaultBranch, worktreeDir);

  await removeWorktree(worktreeDir);

  return result;
};

/**
 * The part that happens inside the worktree, so that removing it afterwards
 * is one statement in the caller rather than a `finally`. Every path here
 * resolves to a `Result` — `git` turns a failing command into one — so the
 * caller's next line always runs.
 */
const rebaseInWorktree = async (
  pr: PullRequest,
  defaultBranch: string,
  worktreeDir: string,
): Promise<Result<string, RebaseFailure>> => {
  const branch = pr.headRefName;

  const rebaseFailed = (detail: string): Result<string, RebaseFailure> =>
    Result.err({ reason: 'rebase-failed', detail });

  const rebased = await git(
    `git rebase ${sh(`origin/${defaultBranch}`)}`,
    worktreeDir,
  );

  if (Result.isErr(rebased)) {
    await git('git rebase --abort', worktreeDir);

    return rebaseFailed(`rebase conflicts: ${lastLines(rebased.value, 5)}`);
  }

  const newHead = await git('git rev-parse HEAD', worktreeDir);

  if (Result.isErr(newHead)) {
    return rebaseFailed(`cannot read the rebased head: ${newHead.value}`);
  }

  const sha = newHead.value.trim();

  if (sha === pr.headRefOid) return Result.ok(sha);

  const baseHead = await git(`git rev-parse ${sh(`origin/${defaultBranch}`)}`);

  if (Result.isOk(baseHead) && sha === baseHead.value.trim()) {
    // The rebase left the branch at the base: every commit on it had a
    // patch already upstream, so `git rebase` skipped the lot. Pushing that
    // would leave a pull request with no commits in it, which auto-merge
    // will never merge, so leave the branch alone and say what happened.
    return Result.err({
      reason: 'already-in-base',
      detail: `every commit is already in ${defaultBranch}; the pull request has nothing left to merge`,
    });
  }

  // The lease names the SHA the survey saw, not the remote-tracking ref: a
  // bare `--force-with-lease` compares against whatever the last fetch
  // left, which is exactly the race this is meant to lose safely.
  const pushed = await git(
    `git push --force-with-lease=${sh(`${branch}:${pr.headRefOid}`)} origin ${sh(`${sha}:refs/heads/${branch}`)}`,
    worktreeDir,
  );

  if (Result.isErr(pushed)) {
    return Result.err({
      reason: 'push-failed',
      detail: `push refused: ${lastLines(pushed.value, 5)}`,
    });
  }

  return Result.ok(sha);
};

/**
 * Brings one pull request as close to merging as this script can: onto the
 * tip of the base, and out from under `skip-ci`.
 *
 * The order is the point. While `skip-ci` is on, the push the rebase makes
 * fires a `synchronize` whose every check workflow skips, so it costs
 * nothing; removing the label afterwards fires `unlabeled`, and the matrix
 * that starts then runs once, on the head that will actually be merged. Doing
 * it the other way round starts a full matrix on the pre-rebase head and has
 * the push cancel it through the concurrency group.
 *
 * A rebase that changes nothing is a failure only when there was no label to
 * take off either: then GitHub's `BEHIND` or `DIRTY` was stale and the survey
 * has to start over. A paused pull request that is already on top of the base
 * is simply one whose only obstacle was the label.
 *
 * The version pull request is the exception: only the label comes off it.
 * `changesets/action` rebuilds that branch from the tip of the base itself
 * and force-pushes the result, so rebasing it here would be a second thing
 * force-pushing one branch — and would carry the old version commit onto a
 * tip whose changesets it never consumed. Triage has already established
 * that the branch is on the tip; there is nothing left to move.
 */
export const advance = async (
  pr: PullRequest,
  defaultBranch: string,
): Promise<Result<Advanced, RebaseFailure>> => {
  if (isVersionPullRequest(pr, defaultBranch)) {
    if (!isSkipCiLabelled(pr)) {
      // Triage only ever offers this one while it is paused, so nothing to
      // take off means the survey is a release behind.
      return Result.ok({ kind: 'stale-merge-state' });
    }

    const unlabelled = await removeSkipCiLabel(pr, pr.headRefOid);

    return Result.isErr(unlabelled)
      ? unlabelled
      : Result.ok({ kind: 'advanced', head: pr.headRefOid });
  }

  const rebased = await rebaseAndPush(pr, defaultBranch);

  if (Result.isErr(rebased)) return rebased;

  const head = rebased.value;

  if (!isSkipCiLabelled(pr)) {
    return head === pr.headRefOid
      ? Result.ok({ kind: 'stale-merge-state' })
      : Result.ok({ kind: 'advanced', head });
  }

  const removed = await removeSkipCiLabel(pr, head);

  return Result.isErr(removed)
    ? removed
    : Result.ok({ kind: 'advanced', head });
};

/**
 * Takes `skip-ci` off, having first asked GitHub whether the pull request
 * still wants it. Removing the label starts a CI matrix, and the survey it
 * was decided on is a rebase old by now.
 */
const removeSkipCiLabel = async (
  pr: PullRequest,
  head: string,
): Promise<Result<undefined, RebaseFailure>> => {
  const failed = (detail: string): Result<undefined, RebaseFailure> =>
    Result.err({ reason: 'unlabel-failed', detail });

  const current = await viewPullRequest(pr.number);

  if (Result.isErr(current)) {
    return failed(`cannot re-read it before unlabelling: ${current.value}`);
  }

  if (current.value.state !== 'OPEN') {
    return failed(`it is ${current.value.state} now`);
  }

  if (current.value.headRefOid !== head) {
    return failed('someone pushed to the branch while it was rebasing');
  }

  if (!isSkipCiLabelled(current.value)) {
    // Someone took the label off in the meantime, which is the thing this was
    // about to do.
    return Result.ok(undefined);
  }

  if (!isMergeQueued(current.value)) {
    return failed(`${MERGE_QUEUED_LABEL} came off while it was rebasing`);
  }

  const removed = await git(
    `gh pr edit ${pr.number} --remove-label ${sh(SKIP_CI_LABEL)}`,
  );

  return Result.isErr(removed)
    ? failed(`cannot remove ${SKIP_CI_LABEL}: ${lastLines(removed.value, 2)}`)
    : Result.ok(undefined);
};

const removeWorktree = async (worktreeDir: string): Promise<void> => {
  // Both fail harmlessly when there is nothing to remove.
  await git(`git worktree remove --force ${sh(worktreeDir)}`);

  await git('git worktree prune');
};
