/**
 * The version pull request — `changeset-release/<base>`, opened and rewritten
 * by `changesets/action` — and what holds it back.
 *
 * It is the one pull request here that is derived rather than written. On
 * every push to the base the release workflow rebuilds the branch from the
 * tip, force-pushes it, and overwrites the title and body through
 * `updatePullRequest`. Two consequences shape everything in this file:
 *
 * - **Nothing written in its body survives.** A `Merge-After:` trailer put
 *   there is wiped by the next push to the base — which, when several pull
 *   requests are queued, is exactly while the ordering still mattered. So the
 *   ordering is declared from the other side, with `blocks-release` on the
 *   pull request the release is waiting for.
 * - **It must not be rebased.** `unblock-prs` and the release workflow would
 *   be two things force-pushing one branch. Worse, a rebase lands the old
 *   version commit on a tip that carries a changeset it never consumed, so
 *   what merges is a release missing the change the queue was assembled for.
 *   Whether the branch is ready is not this script's to fix: it is the
 *   release workflow's, and the only thing to do here is wait for it.
 */

import { Arr, Result } from 'ts-data-forge';
import { git } from './github.mjs';
import { BLOCKS_RELEASE_LABEL } from './labels.mjs';
import {
  type Classification,
  type PullRequest,
  type TriageContext,
} from './types.mjs';
import { lastLines, sh } from './util.mjs';

/** The branch `changesets/action` opens the version pull request from. */
export const versionBranchName = (defaultBranch: string): string =>
  `changeset-release/${defaultBranch}`;

/**
 * Whether this is the version pull request, by the branch it comes from.
 *
 * The branch name is the only stable handle on it: the title and body are
 * rewritten on every run and the number changes with every release, because
 * each one is a new pull request opened after the last was merged.
 */
export const isVersionPullRequest = (
  pr: PullRequest,
  defaultBranch: string,
): boolean => pr.headRefName === versionBranchName(defaultBranch);

/**
 * Why the version pull request is not being picked this cycle, if it is not.
 *
 * Two things hold it, and both are reported rather than acted on. Nothing
 * here can clear either: a `blocks-release` pull request ends when a person
 * merges or closes it, and a branch built on a stale tip is rebuilt by the
 * release workflow's next run.
 */
export const versionPullRequestHold = async (
  pr: PullRequest,
  context: TriageContext,
): Promise<Classification | undefined> => {
  const blockers = releaseBlockers(pr, context);

  if (Arr.isNonEmpty(blockers)) {
    return {
      kind: 'note',
      note: `#${pr.number}: ${BLOCKS_RELEASE_LABEL} on ${blockers
        .map(
          (blocker) => `#${blocker.number}${blocker.isDraft ? ' (draft)' : ''}`,
        )
        .join(', ')} — still open, so the release waits`,
    };
  }

  const rebuilt = await isRebuiltOnBaseTip(pr, context);

  if (Result.isErr(rebuilt)) {
    return {
      kind: 'note',
      note: `#${pr.number}: cannot tell whether it was rebuilt on ${context.baseSha.slice(0, 10)}: ${rebuilt.value}`,
    };
  }

  return rebuilt.value
    ? undefined
    : {
        kind: 'note',
        note: `#${pr.number}: built before ${context.defaultBranch} reached ${context.baseSha.slice(0, 10)}; waiting for the release workflow to rebuild it`,
      };
};

/**
 * The open pull requests that declared the release must wait for them.
 *
 * The version pull request is never one of its own blockers: the label on it
 * would otherwise hold it for as long as it existed, with nothing able to
 * take it off — the same shape as a `Merge-After` cycle, and not worth a
 * second way of saying so.
 */
export const releaseBlockers = (
  pr: PullRequest,
  context: TriageContext,
): readonly PullRequest[] =>
  context.releaseBlockers.filter((blocker) => blocker.number !== pr.number);

/**
 * Whether the branch was built on the current tip of the base — the question
 * `mergeStateStatus` is asked everywhere else here, asked of git instead.
 *
 * GitHub's answer is computed asynchronously and cached, and being wrong
 * about this one releases a set the branch was built before, so it is worth
 * a fetch. `git merge-base` rather than `--is-ancestor`, whose "no" is an
 * exit status this module could not tell apart from a git that failed.
 */
const isRebuiltOnBaseTip = async (
  pr: PullRequest,
  context: TriageContext,
): Promise<Result<boolean, string>> => {
  const fetched = await git(
    `git fetch --quiet origin ${sh(context.defaultBranch)} ${sh(pr.headRefName)}`,
  );

  if (Result.isErr(fetched)) {
    return Result.err(`fetch failed: ${lastLines(fetched.value, 2)}`);
  }

  const mergeBase = await git(
    `git merge-base ${sh(context.baseSha)} ${sh(pr.headRefOid)}`,
  );

  return Result.isErr(mergeBase)
    ? Result.err(`merge-base failed: ${lastLines(mergeBase.value, 2)}`)
    : Result.ok(mergeBase.value.trim() === context.baseSha);
};
