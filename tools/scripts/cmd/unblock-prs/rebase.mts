// cspell:ignore unlabel unlabelling retarget retargeted

/**
 * Moving a branch: onto the tip of the base, with the layers stacked on it
 * carried along, and out from under `skip-ci` — or, for a layer the one below
 * it merged from under, off that layer's commits and nothing more.
 */

import * as os from 'node:os';
import * as path from 'node:path';
import {
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
  stackDescendants,
} from 'pr-report-core';
import { Arr, isRecord, Result } from 'ts-data-forge';
import {
  armAutoMerge,
  git,
  mergedHeadOf,
  readBaseChanges,
  remoteSha,
  removeWorktree,
  viewPullRequest,
  type MergedHead,
} from './github.mjs';
import { isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import {
  describeCommandFailure,
  describeConflict,
} from './set-aside-detail.mjs';
import { withSkip } from './skips.mjs';
import {
  autoRebaseTargets,
  restackable,
  retargetedFrom,
  retargetedLayers,
  stackParentsOf,
} from './stack.mjs';
import {
  type Advanced,
  type AdvancePlan,
  type PullRequest,
  type RebaseFailure,
  type RetargetedLayer,
  type SkipRecords,
  type StackedOn,
} from './types.mjs';
import { isSafeRefName, lastLines, log, sh, stopRequested } from './util.mjs';
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

  const rebaseFailed = (
    detail: string,
    output?: string,
  ): Result<Rebased, RebaseFailure> =>
    Result.err({
      reason: 'rebase-failed',
      detail,
      ...(output === undefined ? {} : { output }),
    });

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
      rebased.value,
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
          output: pushed.value,
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
 * Rebases every pull request GitHub moved onto the default branch when the
 * layer below it merged, and that still carries that layer's commits, off
 * them: `--onto` from the head the layer merged at to the squash commit it
 * merged as, carrying the layers stacked on it along. `stack.mts` says why
 * this waits for no queue, and why the tree comes out as it went in.
 *
 * Nothing is armed or released: `skip-ci` stays as it is, and a push under
 * it fires a `synchronize` whose every check skips. Resolves to whether any
 * branch moved — by this, or by someone else under it — since either makes
 * the heads the survey read stale.
 */
export const restackRetargeted = async (
  before: StackedOn | undefined,
  pullRequests: readonly PullRequest[],
  defaultBranch: string,
  dryRun: boolean,
): Promise<boolean> => {
  const stackParents = stackParentsOf(pullRequests, defaultBranch);

  let mut_moved = false;

  for (const layer of retargetedLayers(before, pullRequests, defaultBranch)) {
    if (stopRequested()) {
      break;
    }

    const outcome = await restackOffMerged(layer, defaultBranch, {
      dryRun,
      descendants: stackDescendants(stackParents, layer.pr.number).flatMap(
        (number) => pullRequests.filter((pr) => pr.number === number),
      ),
    });

    mut_moved ||= outcome !== 'untouched';
  }

  return mut_moved;
};

/**
 * Rebases the pull requests that asked for it and are paused by `skip-ci`
 * and behind the default branch onto it, carrying the layers stacked on each
 * along, so that a stack waiting for review or for its turn keeps a diff of
 * its own changes only. The push runs no checks: the label skips every workflow.
 * `stack.mts` says which pull requests are eligible.
 *
 * A rebase that conflicts, or a push that is refused, is a set-aside like any
 * other and is returned as one, tied to the head and the base it was tried at.
 * Resolves to those records and whether any branch moved — by this, or by
 * someone else under it — since either makes the survey stale.
 */
export const restackBehind = async (
  pullRequests: readonly PullRequest[],
  defaultBranch: string,
  context: Readonly<{
    baseSha: string;
    skipped: SkipRecords;
    dryRun: boolean;
  }>,
): Promise<Readonly<{ skipped: SkipRecords; moved: boolean }>> => {
  const targets = autoRebaseTargets(
    pullRequests,
    defaultBranch,
    context.baseSha,
    context.skipped,
  );

  if (!Arr.isNonEmpty(targets)) {
    return { skipped: context.skipped, moved: false };
  }

  const fetched = await git(
    Arr.toUnshifted('git fetch --quiet origin')(
      Arr.toUnshifted(defaultBranch)(targets.map((pr) => pr.headRefName)).map(
        sh,
      ),
    ).join(' '),
  );

  if (Result.isErr(fetched)) {
    log(`Cannot fetch to see what is behind: ${lastLines(fetched.value, 2)}`);

    return { skipped: context.skipped, moved: false };
  }

  const stackParents = stackParentsOf(pullRequests, defaultBranch);

  let mut_skipped = context.skipped;

  let mut_moved = false;

  for (const pr of targets) {
    if (stopRequested()) {
      break;
    }

    // Ancestry rather than `mergeStateStatus`: `skip-ci` holds that at
    // `BLOCKED` whether or not the branch is behind.
    const upToDate = await git(
      `git merge-base --is-ancestor ${sh(`origin/${defaultBranch}`)} ${sh(pr.headRefOid)}`,
    );

    if (Result.isOk(upToDate)) {
      continue;
    }

    if (context.dryRun) {
      log(`Would rebase #${pr.number} onto ${defaultBranch}; it is behind.`);

      continue;
    }

    const rebased = await rebaseAndPush(pr, {
      onto: `origin/${defaultBranch}`,
      fetch: [defaultBranch],
      upstream: undefined,
    });

    if (Result.isErr(rebased)) {
      log(
        `#${pr.number}: behind ${defaultBranch}, and not rebased — ${rebased.value.detail}`,
      );

      mut_skipped = withSkip(mut_skipped, {
        number: pr.number,
        headSha: pr.headRefOid,
        baseSha: context.baseSha,
        reason: rebased.value.reason,
        detail: rebased.value.detail,
        ...(rebased.value.output === undefined
          ? {}
          : { output: rebased.value.output }),
      });

      continue;
    }

    if (rebased.value.kind === 'moved') {
      mut_moved = true;

      continue;
    }

    const { head } = rebased.value;

    if (head === pr.headRefOid) {
      continue;
    }

    mut_moved = true;

    log(
      `#${pr.number}: was behind ${defaultBranch}; rebased at ${head.slice(0, 10)}.`,
    );

    await restack(
      pr,
      head,
      stackDescendants(stackParents, pr.number).flatMap((number) =>
        pullRequests.filter((layer) => layer.number === number),
      ),
    );
  }

  return { skipped: mut_skipped, moved: mut_moved };
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
  const failed = (
    detail: string,
    output?: string,
  ): Result<'moved' | 'removed', RebaseFailure> =>
    Result.err({
      reason: 'unlabel-failed',
      detail,
      ...(output === undefined ? {} : { output }),
    });

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
    ? failed(
        `cannot remove ${SKIP_CI_LABEL}: ${describeCommandFailure(removed.value)}`,
        removed.value,
      )
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
  const changes = await readBaseChanges(pr.number);

  if (Result.isErr(changes)) {
    log(
      `#${pr.number}: cannot read whether it came off a stack; rebasing by patch. (${lastLines(changes.value, 2)})`,
    );

    return undefined;
  }

  const from = retargetedFrom(changes.value, defaultBranch);

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
 * One layer of `restackRetargeted`. Whatever cannot be read or done is said
 * and left: the layer is where GitHub put it, which is where it would be
 * without this.
 */
const restackOffMerged = async (
  { pr, from }: RetargetedLayer,
  defaultBranch: string,
  plan: Readonly<{ dryRun: boolean; descendants: readonly PullRequest[] }>,
): Promise<'moved' | 'restacked' | 'untouched'> => {
  const branch = from ?? (await retargetedFromTimeline(pr, defaultBranch));

  if (branch === undefined || !isSafeRefName(branch)) {
    return 'untouched';
  }

  const merged = await mergedHeadOf(branch);

  if (Result.isErr(merged)) {
    log(
      `#${pr.number}: cannot read what merged from ${branch}, so not rebasing it off that. (${lastLines(merged.value, 2)})`,
    );

    return 'untouched';
  }

  // Nothing merged from that branch: the layer below was closed, or a person
  // moved this one.
  if (merged.value === undefined) {
    return 'untouched';
  }

  const { number, headSha, mergeCommit } = merged.value;

  const carried = await carries(pr, headSha, [
    defaultBranch,
    `refs/pull/${number}/head`,
  ]);

  if (Result.isErr(carried)) {
    log(
      `#${pr.number}: cannot tell whether it still carries #${number}'s commits. (${lastLines(carried.value, 2)})`,
    );

    return 'untouched';
  }

  // GitHub rebased it itself, or this already has.
  if (!carried.value) {
    return 'untouched';
  }

  if (mergeCommit === undefined) {
    log(
      `#${pr.number}: still carries #${number}'s commits, but GitHub does not say what #${number} merged as; leaving it.`,
    );

    return 'untouched';
  }

  if (plan.dryRun) {
    log(
      `Would rebase #${pr.number} off #${number}'s commits, onto the squash commit ${mergeCommit.slice(0, 10)}.`,
    );

    return 'untouched';
  }

  // `carries` has just fetched everything the rebase needs.
  const rebased = await rebaseAndPush(pr, {
    onto: mergeCommit,
    fetch: [],
    upstream: { sha: headSha, required: true },
  });

  if (Result.isErr(rebased)) {
    log(
      `#${pr.number}: still carries #${number}'s commits, and cannot be rebased off them — ${rebased.value.detail}`,
    );

    return 'untouched';
  }

  if (rebased.value.kind === 'moved') {
    log(
      `#${pr.number}: not rebased off #${number}'s commits — its branch moved since the survey, so someone else is moving it.`,
    );

    return 'moved';
  }

  const { head } = rebased.value;

  log(
    `#${pr.number}: came off #${number} still carrying its commits; rebased its own onto #${number}'s squash commit ${mergeCommit.slice(0, 10)}, at ${head.slice(0, 10)}.`,
  );

  await restack(pr, head, plan.descendants);

  return 'restacked';
};

/**
 * The branch the pull request's timeline says GitHub moved it off, if it
 * did. A timeline that cannot be read says nothing.
 */
const retargetedFromTimeline = async (
  pr: PullRequest,
  defaultBranch: string,
): Promise<string | undefined> => {
  const changes = await readBaseChanges(pr.number);

  if (Result.isErr(changes)) {
    log(
      `#${pr.number}: cannot read whether it came off a stack, so not rebasing it off one. (${lastLines(changes.value, 2)})`,
    );

    return undefined;
  }

  return retargetedFrom(changes.value, defaultBranch);
};

/**
 * Whether the pull request's head, as the survey saw it, contains `sha`,
 * having fetched the branch and `refspecs` to find out.
 */
const carries = async (
  pr: PullRequest,
  sha: string,
  refspecs: readonly string[],
): Promise<Result<boolean, string>> => {
  const fetched = await git(
    Arr.toUnshifted('git fetch --quiet origin')(
      Arr.toPushed(refspecs, pr.headRefName).map(sh),
    ).join(' '),
  );

  if (Result.isErr(fetched)) {
    return Result.err(fetched.value);
  }

  const contained = await git(
    `git merge-base --is-ancestor ${sh(sha)} ${sh(pr.headRefOid)}`,
  );

  return Result.ok(Result.isOk(contained));
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
 * `removeSkipCiLabel`.
 *
 * Called for one it rebases after the push and before `skip-ci` comes off, so
 * that the label holds the merge until the matrix that decides it starts; and
 * for one already up to date before it is watched.
 *
 * Nothing else arms one. `open-pr` opens a pull request with none, and the
 * author queueing it with `merge-queued` is the request to land it. Arming at
 * pick time rather than at opening is what keeps a stacked pull request
 * unarmed while it is stacked: its base is another pull request's branch,
 * which no ruleset covers, so armed there it would merge into that branch
 * the moment nothing held it. It is picked only once GitHub has moved it onto
 * the default branch, where the ruleset gates the merge.
 *
 * `merge-queued` is the only thing read as permission, so one that has lost
 * its auto-merge — GitHub disarms it when the base changes, and a person may
 * switch it off — is armed again when it is next picked. Holding one back is
 * taking `merge-queued` off.
 */
export const armOnPick = async (
  pr: PullRequest,
  head: string,
  defaultBranch: string,
): Promise<Result<'armed' | 'moved', RebaseFailure>> => {
  const failed = (
    detail: string,
    output?: string,
  ): Result<'armed' | 'moved', RebaseFailure> =>
    Result.err({
      reason: 'arm-failed',
      detail,
      ...(output === undefined ? {} : { output }),
    });

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
    return failed(
      `cannot arm auto-merge: ${describeCommandFailure(armed.value)}`,
      armed.value,
    );
  }

  log(`#${pr.number}: auto-merge armed.`);

  return Result.ok('armed');
};
