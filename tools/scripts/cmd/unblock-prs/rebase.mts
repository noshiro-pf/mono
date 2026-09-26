// cspell:ignore unlabel unlabelling retarget retargeted

/**
 * Moving a branch: onto the tip of the base, with the layers stacked on it
 * carried along, and out from under `skip-ci`.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import { MERGE_QUEUED_LABEL, SKIP_CI_LABEL } from 'pr-report-core';
import { Arr, isRecord, Result } from 'ts-data-forge';
import {
  armAutoMerge,
  git,
  mergedHeadOf,
  readTimeline,
  remoteSha,
  viewPullRequest,
  type MergedHead,
} from './github.mjs';
import { isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import { describeConflict } from './set-aside-detail.mjs';
import { restackable, retargetedFrom } from './stack.mjs';
import {
  type Advanced,
  type AdvancePlan,
  type PullRequest,
  type RebaseFailure,
} from './types.mjs';
import { isSafeRefName, lastLines, log, sh } from './util.mjs';
import { isVersionPullRequest } from './version-pr.mjs';

/**
 * Where a branch is rebased to, and what it is rebased from.
 *
 * `onto` is a revision: `origin/<default branch>` for a pull request's own
 * turn, or the new head of the layer below for a restack. `upstream`, when
 * given, is the commit below the branch's own commits, and makes the rebase
 * `git rebase --onto <onto> <upstream>`: exactly the commits after it are
 * replayed, whatever their patches look like upstream. `required` says what
 * to do when the branch does not contain it: fail, or fall back to a plain
 * rebase, which drops commits already upstream by their patches.
 */
type RebaseTarget = Readonly<{
  onto: string;
  /** Refspecs to fetch from `origin` besides the branch itself. */
  fetch: readonly string[];
  upstream: Readonly<{ sha: string; required: boolean }> | undefined;
}>;

/**
 * Rebases the pull request's branch in a throwaway worktree and
 * force-pushes the result, expecting the remote branch to still be at the
 * head the survey saw. Resolves to the new head, or to `moved` when the
 * branch is no longer where the survey saw it.
 *
 * The worktree is detached, so the checkout this runs from is never touched,
 * and it is removed on the way out of every path: the work inside it is a
 * function of its own, and this one removes the worktree after it returns
 * however it returned. A process killed mid-rebase leaves one behind, which
 * is what the `removeWorktree` before `git worktree add` is for.
 */
const rebaseAndPush = async (
  pr: PullRequest,
  target: RebaseTarget,
): Promise<Result<Rebased, RebaseFailure>> => {
  const branch = pr.headRefName;

  const worktreeDir = path.join(os.tmpdir(), 'unblock-prs', `pr-${pr.number}`);

  const rebaseFailed = (detail: string): Result<Rebased, RebaseFailure> =>
    Result.err({ reason: 'rebase-failed', detail });

  // A previous run may have been interrupted with this worktree in place.
  await removeWorktree(worktreeDir);

  const fetched = await git(
    Arr.toUnshifted('git fetch --quiet origin')(
      Arr.toPushed(target.fetch, branch).map(sh),
    ).join(' '),
  );

  if (Result.isErr(fetched)) {
    return rebaseFailed(`fetch failed: ${fetched.value}`);
  }

  const remoteHead = await git(`git rev-parse ${sh(`origin/${branch}`)}`);

  if (Result.isErr(remoteHead)) {
    return rebaseFailed(`cannot resolve origin/${branch}: ${remoteHead.value}`);
  }

  if (remoteHead.value.trim() !== pr.headRefOid) {
    return Result.ok({ kind: 'moved' });
  }

  const added = await git(
    `git worktree add --detach ${sh(worktreeDir)} ${sh(pr.headRefOid)}`,
  );

  if (Result.isErr(added)) {
    return rebaseFailed(`checkout failed: ${added.value}`);
  }

  const result = await rebaseInWorktree(pr, target, worktreeDir);

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
  target: RebaseTarget,
  worktreeDir: string,
): Promise<Result<Rebased, RebaseFailure>> => {
  const branch = pr.headRefName;

  const rebaseFailed = (detail: string): Result<Rebased, RebaseFailure> =>
    Result.err({ reason: 'rebase-failed', detail });

  const { upstream } = target;

  const contained =
    upstream !== undefined &&
    Result.isOk(
      await git(
        `git merge-base --is-ancestor ${sh(upstream.sha)} HEAD`,
        worktreeDir,
      ),
    );

  if (!contained && upstream?.required === true) {
    return rebaseFailed(
      `it does not contain ${upstream.sha.slice(0, 10)}, the head it was stacked on, so which commits are its own cannot be told`,
    );
  }

  const rebased = await git(
    contained
      ? `git rebase --onto ${sh(target.onto)} ${sh(upstream.sha)}`
      : `git rebase ${sh(target.onto)}`,
    worktreeDir,
  );

  if (Result.isErr(rebased)) {
    const conflicted = await git(
      'git diff --name-only --diff-filter=U',
      worktreeDir,
    );

    await git('git rebase --abort', worktreeDir);

    return rebaseFailed(
      describeConflict(
        Result.isOk(conflicted)
          ? conflicted.value.split('\n').filter((line) => line !== '')
          : [],
        lastLines(rebased.value, 5),
        target.onto,
      ),
    );
  }

  const newHead = await git('git rev-parse HEAD', worktreeDir);

  if (Result.isErr(newHead)) {
    return rebaseFailed(`cannot read the rebased head: ${newHead.value}`);
  }

  const sha = newHead.value.trim();

  if (sha === pr.headRefOid) {
    return Result.ok({ kind: 'rebased', head: sha });
  }

  const ontoHead = await git(`git rev-parse ${sh(target.onto)}`, worktreeDir);

  if (Result.isOk(ontoHead) && sha === ontoHead.value.trim()) {
    // The rebase left the branch at what it was rebased onto: every commit
    // on it had a patch already there, so `git rebase` skipped the lot.
    // Pushing that would leave a pull request with no commits in it, which
    // auto-merge will never merge, so leave the branch alone and say what
    // happened.
    return Result.err({
      reason: 'already-in-base',
      detail: `every commit is already in ${target.onto}; the pull request has nothing left to merge`,
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
    // A lease that lost is someone else pushing in the time the rebase took,
    // and that is not a reason to set the pull request aside.
    const remoteHeadNow = await remoteSha(branch);

    return Result.isOk(remoteHeadNow) && remoteHeadNow.value !== pr.headRefOid
      ? Result.ok({ kind: 'moved' })
      : Result.err({
          reason: 'push-failed',
          detail: `push refused: ${lastLines(pushed.value, 5)}`,
        });
  }

  return Result.ok({ kind: 'rebased', head: sha });
};

type Rebased = Readonly<{ kind: 'moved' } | { kind: 'rebased'; head: string }>;

/**
 * Brings one pull request as close to merging as this script can: onto the
 * tip of the base, with the layers stacked on it carried along, armed, and
 * out from under `skip-ci`.
 *
 * The order is the point. While `skip-ci` is on, the push the rebase makes
 * fires a `synchronize` whose every check workflow skips, so it costs
 * nothing; removing the label afterwards fires `unlabeled`, and the matrix
 * that starts then runs once, on the head that will actually be merged. Doing
 * it the other way round starts a full matrix on the pre-rebase head and has
 * the push cancel it through the concurrency group. Arming comes between
 * the two, so that while it happens the label still holds the merge.
 *
 * A pull request GitHub moved off a stack is rebased with `--onto` from the
 * head its merged parent was merged at, when it still contains that head —
 * GitHub's own rebase on retargeting can fail, and then the branch still
 * carries the parent's commits, whose patches match the squash commit only
 * if nothing changed them on the way in. Otherwise the plain rebase drops
 * them by patch, as it always has.
 *
 * A rebase that changes nothing is a failure only when there was no label to
 * take off either: then GitHub's `BEHIND` or `DIRTY` was stale and the survey
 * has to start over. A paused pull request that is already on top of the base
 * is simply one whose only obstacle was the label.
 *
 * A branch that moves while this is moving it is someone else moving the same
 * pull request — the skill runs beside this script, and a person may push —
 * so it resolves to `moved` and leaves the rest to that someone. Recording it
 * as a failure would set a pull request aside for being worked on, and trying
 * the next candidate would start a second matrix beside the one the other
 * writer is about to start.
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
  plan: AdvancePlan,
): Promise<Result<Advanced, RebaseFailure>> => {
  if (isVersionPullRequest(pr, defaultBranch)) {
    if (!isSkipCiLabelled(pr)) {
      // Triage only ever offers this one while it is paused, so nothing to
      // take off means the survey is a release behind.
      return Result.ok({ kind: 'stale-merge-state' });
    }

    if (plan.arm) {
      const armed = await armOnPick(pr, pr.headRefOid, defaultBranch);

      if (Result.isErr(armed) || armed.value === 'moved') {
        return Result.isErr(armed) ? armed : Result.ok({ kind: 'moved' });
      }
    }

    const unlabelled = await removeSkipCiLabel(pr, pr.headRefOid);

    return Result.isErr(unlabelled)
      ? unlabelled
      : Result.ok(
          unlabelled.value === 'moved'
            ? { kind: 'moved' }
            : { kind: 'advanced', head: pr.headRefOid },
        );
  }

  const merged = await stackedOnMerged(pr, defaultBranch);

  const rebased = await rebaseAndPush(pr, {
    onto: `origin/${defaultBranch}`,
    fetch:
      merged === undefined
        ? [defaultBranch]
        : [defaultBranch, `refs/pull/${merged.number}/head`],
    upstream:
      merged === undefined
        ? undefined
        : { sha: merged.headSha, required: false },
  });

  if (Result.isErr(rebased)) {
    return rebased;
  }

  if (rebased.value.kind === 'moved') {
    return Result.ok({ kind: 'moved' });
  }

  const { head } = rebased.value;

  if (head !== pr.headRefOid) {
    await restack(pr, head, plan.descendants);
  }

  if (plan.arm) {
    const armed = await armOnPick(pr, head, defaultBranch);

    if (Result.isErr(armed) || armed.value === 'moved') {
      return Result.isErr(armed) ? armed : Result.ok({ kind: 'moved' });
    }
  }

  if (!isSkipCiLabelled(pr)) {
    return head === pr.headRefOid
      ? Result.ok({ kind: 'stale-merge-state' })
      : Result.ok({ kind: 'advanced', head });
  }

  const removed = await removeSkipCiLabel(pr, head);

  return Result.isErr(removed)
    ? removed
    : Result.ok(
        removed.value === 'moved'
          ? { kind: 'moved' }
          : { kind: 'advanced', head },
      );
};

/**
 * Takes `skip-ci` off, having first asked GitHub whether the pull request
 * still wants it. Removing the label starts a CI matrix, and the survey it
 * was decided on is a rebase old by now.
 */
const removeSkipCiLabel = async (
  pr: PullRequest,
  head: string,
): Promise<Result<'moved' | 'removed', RebaseFailure>> => {
  const failed = (detail: string): Result<'moved' | 'removed', RebaseFailure> =>
    Result.err({ reason: 'unlabel-failed', detail });

  const current = await viewPullRequest(pr.number);

  if (Result.isErr(current)) {
    return failed(`cannot re-read it before unlabelling: ${current.value}`);
  }

  if (current.value.state !== 'OPEN') {
    return failed(`it is ${current.value.state} now`);
  }

  if (current.value.headRefOid !== head) {
    return Result.ok('moved');
  }

  if (!isSkipCiLabelled(current.value)) {
    // Someone took the label off in the meantime, which is the thing this was
    // about to do.
    return Result.ok('removed');
  }

  if (!isMergeQueued(current.value)) {
    return failed(`${MERGE_QUEUED_LABEL} came off while it was rebasing`);
  }

  const removed = await git(
    `gh pr edit ${pr.number} --remove-label ${sh(SKIP_CI_LABEL)}`,
  );

  return Result.isErr(removed)
    ? failed(`cannot remove ${SKIP_CI_LABEL}: ${lastLines(removed.value, 2)}`)
    : Result.ok('removed');
};

/**
 * The layer this pull request was stacked on, if GitHub moved it onto the
 * default branch when that layer merged — and so the head below its own
 * commits, if GitHub did not rebase it. Anything that cannot be read is
 * `undefined`, and the rebase falls back to dropping commits by their
 * patches, which a one-commit layer squash-merged unchanged also survives.
 */
const stackedOnMerged = async (
  pr: PullRequest,
  defaultBranch: string,
): Promise<MergedHead | undefined> => {
  const events = await readTimeline(pr.number);

  if (Result.isErr(events)) {
    log(
      `#${pr.number}: cannot read whether it came off a stack; rebasing by patch. (${lastLines(events.value, 2)})`,
    );

    return undefined;
  }

  const from = retargetedFrom(events.value, defaultBranch);

  if (from === undefined || !isSafeRefName(from)) {
    return undefined;
  }

  const merged = await mergedHeadOf(from);

  if (Result.isErr(merged)) {
    log(
      `#${pr.number}: cannot read what merged from ${from}; rebasing by patch. (${lastLines(merged.value, 2)})`,
    );

    return undefined;
  }

  return merged.value;
};

/**
 * Carries every layer stacked on `pr` along after it moved from its old head
 * to `head`: each is replayed with `--onto` from the head it was on to the
 * one that replaced it, lowest layer first so that each finds its own new
 * base already pushed. A layer that cannot be moved, or that someone else
 * moved first, is reported and left where it is, and so is everything on
 * it; none of this stops `pr` itself, whose turn it is.
 */
const restack = async (
  pr: PullRequest,
  head: string,
  descendants: readonly PullRequest[],
): Promise<void> => {
  const mut_moved = new Map<string, Readonly<{ from: string; to: string }>>([
    [pr.headRefName, { from: pr.headRefOid, to: head }],
  ]);

  for (const layer of descendants) {
    const below = mut_moved.get(layer.baseRefName);

    if (below === undefined) {
      log(
        `#${layer.number}: not restacked — the layer it is on, ${layer.baseRefName}, did not move.`,
      );

      continue;
    }

    const refused = restackable(layer);

    if (refused !== undefined) {
      log(`#${layer.number}: not restacked — ${refused}.`);

      continue;
    }

    const moved = await rebaseAndPush(layer, {
      onto: below.to,
      fetch: [],
      upstream: { sha: below.from, required: true },
    });

    if (Result.isErr(moved)) {
      log(
        `#${layer.number}: not restacked onto ${layer.baseRefName} — ${moved.value.detail}`,
      );

      continue;
    }

    if (moved.value.kind === 'moved') {
      log(
        `#${layer.number}: not restacked — its branch moved since the survey, so someone else is moving it.`,
      );

      continue;
    }

    log(
      `#${layer.number}: restacked onto ${layer.baseRefName} at ${below.to.slice(0, 10)}.`,
    );

    mut_moved.set(layer.headRefName, {
      from: layer.headRefOid,
      to: moved.value.head,
    });
  }
};

/**
 * Arms auto-merge on the pull request this cycle picked, having first asked
 * whether it is still what triage saw: open, on the default branch, queued,
 * at `head`. A head other than that is someone else moving it, as in
 * `removeSkipCiLabel`. `auto-merge.mts` says why this script is what arms it.
 *
 * Called for one it rebases after the push and before `skip-ci` comes off, so
 * that the label holds the merge until the matrix that decides it starts; and
 * for one already up to date before it is watched.
 */
export const armOnPick = async (
  pr: PullRequest,
  head: string,
  defaultBranch: string,
): Promise<Result<'armed' | 'moved', RebaseFailure>> => {
  const failed = (detail: string): Result<'armed' | 'moved', RebaseFailure> =>
    Result.err({ reason: 'arm-failed', detail });

  const current = await viewPullRequest(pr.number);

  if (Result.isErr(current)) {
    return failed(`cannot re-read it before arming: ${current.value}`);
  }

  if (current.value.state === 'OPEN' && current.value.headRefOid !== head) {
    return Result.ok('moved');
  }

  const refused =
    current.value.state !== 'OPEN'
      ? (`it is ${current.value.state} now` as const)
      : current.value.baseRefName !== defaultBranch
        ? (`its base is ${current.value.baseRefName} now` as const)
        : !isMergeQueued(current.value)
          ? (`${MERGE_QUEUED_LABEL} came off before it was armed` as const)
          : undefined;

  if (refused !== undefined) {
    return failed(`not arming auto-merge: ${refused}`);
  }

  if (isRecord(current.value.autoMergeRequest)) {
    return Result.ok('armed');
  }

  const armed = await armAutoMerge(current.value.id);

  if (Result.isErr(armed)) {
    return failed(`cannot arm auto-merge: ${lastLines(armed.value, 2)}`);
  }

  log(`#${pr.number}: auto-merge armed.`);

  return Result.ok('armed');
};

const removeWorktree = async (worktreeDir: string): Promise<void> => {
  // Both fail harmlessly when there is nothing to remove.
  await git(`git worktree remove --force ${sh(worktreeDir)}`);

  await git('git worktree prune');
};
