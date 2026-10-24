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

import { BLOCKS_RELEASE_LABEL, isVersionBranch } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import { git, sh } from '../../lib/shell.mjs';
import type { Classification, PullRequest, TriageContext } from './types.mjs';
import { lastLines } from './util.mjs';

/**
 * Whether this is the version pull request, by the branch it comes from
 * (`isVersionBranch`).
 */
export const isVersionPullRequest = (
  pr: PullRequest,
  defaultBranch: string,
): boolean => isVersionBranch(pr.headRefName, defaultBranch);

/**
 * What to report while pull requests labelled `blocks-release` are open.
 * Nothing here can clear it: a `blocks-release` pull request ends when a
 * person merges or closes it.
 */
export const releaseBlockedNote = (
  pr: PullRequest,
  by: readonly Readonly<{ number: number; isDraft: boolean }>[],
): Classification =>
  ({
    kind: 'note',
    note: `#${pr.number}: ${BLOCKS_RELEASE_LABEL} on ${by
      .map(
        (blocker) => `#${blocker.number}${blocker.isDraft ? ' (draft)' : ''}`,
      )
      .join(', ')} — still open, so the release waits`,
  }) as const;

/**
 * What to report while the branch was built on a stale tip, which the
 * release workflow's next run rebuilds.
 */
export const releaseStaleNote = (
  pr: PullRequest,
  context: Readonly<{ defaultBranch: string; baseSha: string }>,
): Classification =>
  ({
    kind: 'note',
    note: `#${pr.number}: built before ${context.defaultBranch} reached ${context.baseSha.slice(0, 10)}; waiting for the release workflow to rebuild it`,
  }) as const;

/**
 * Whether the branch was built on the current tip of the base — the question
 * `mergeStateStatus` is asked everywhere else here, asked of git instead —
 * or, when git cannot say, the note to report.
 *
 * GitHub's answer is computed asynchronously and cached, and being wrong
 * about this one releases a set the branch was built before, so it is worth
 * a fetch. `git merge-base` rather than `--is-ancestor`, whose "no" is an
 * exit status this module could not tell apart from a git that failed.
 */
export const isRebuiltOnBaseTip = async (
  pr: PullRequest,
  context: TriageContext,
): Promise<Result<boolean, Classification>> => {
  const answered = await mergeBaseIsTip(pr, context);

  return Result.isErr(answered)
    ? Result.err({
        kind: 'note',
        note: `#${pr.number}: cannot tell whether it was rebuilt on ${context.baseSha.slice(0, 10)}: ${answered.value}`,
      })
    : answered;
};

const mergeBaseIsTip = async (
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
