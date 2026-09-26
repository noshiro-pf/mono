/**
 * Holding the queue to one released pull request.
 *
 * A pull request labelled `merge-queued` without `skip-ci` is released: a push
 * to it, or the label coming off, runs the full matrix. Only one of them can
 * merge before `main` moves and puts the rest back to `BEHIND`, so a second
 * released pull request is a matrix run to be thrown away. Whatever releases
 * one — this script, the skill, a person — first puts `skip-ci` on every other,
 * and looks again afterwards, because two writers releasing in the same moment
 * each saw the other still paused.
 *
 * The case it exists for: A fails and is set aside with its label off, this
 * script releases B, and the skill pushes A's fix — two matrices, one of them
 * wasted. The README, "One released pull request at a time", walks through it.
 */

import { SKIP_CI_LABEL } from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import { addSkipCiLabel, listPullRequests } from './github.mjs';
import { isMergeQueued, isSkipCiLabelled } from './labels.mjs';
import { type PullRequest } from './types.mjs';
import { log } from './util.mjs';
import { isVersionPullRequest } from './version-pr.mjs';

/**
 * Puts `skip-ci` on every released pull request but `keep`. Called before
 * `keep` is released, and while it is the one being watched, which is what
 * catches a pull request opened already released — `pnpm-update.yml` opens
 * its own that way. A label that could not be added is logged and nothing
 * more: what it costs is a matrix, not a wrong merge.
 */
export const pauseAllBut = async (keep: number): Promise<void> => {
  const listed = await listPullRequests();

  if (Result.isErr(listed)) {
    log(`Cannot list pull requests to pause the others: ${listed.value}`);

    return;
  }

  await pause(releasedExcept(listed.value, keep));
};

/**
 * Looks again once `target` has been released, and settles two releases made
 * in the same moment the way both writers settle them: the one first in
 * {@link firstInReleaseOrder} keeps its release and every other is paused.
 * Resolves to whether that one is `target`.
 */
export const settleAfterRelease = async (
  target: PullRequest,
  defaultBranch: string,
): Promise<'kept' | 'yielded'> => {
  const listed = await listPullRequests();

  if (Result.isErr(listed)) {
    log(`Cannot list pull requests to check the release: ${listed.value}`);

    return 'kept';
  }

  const released = releasedExcept(listed.value, undefined);

  const keep = firstInReleaseOrder(released, defaultBranch) ?? target;

  await pause(released.filter((pr) => pr.number !== keep.number));

  return keep.number === target.number ? 'kept' : 'yielded';
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
 * Which of several released pull requests keeps its release: the lowest
 * number, the version pull request last — the order candidates are picked
 * in, so that the skill, reading the same rule, settles it the same way.
 */
export const firstInReleaseOrder = (
  released: readonly PullRequest[],
  defaultBranch: string,
): PullRequest | undefined => {
  const rank = (pr: PullRequest): number =>
    isVersionPullRequest(pr, defaultBranch) ? 1 : 0;

  const sorted = released.toSorted((a, b) =>
    rank(a) === rank(b) ? a.number - b.number : rank(a) - rank(b),
  );

  return Arr.isNonEmpty(sorted) ? sorted[0] : undefined;
};

const pause = async (pullRequests: readonly PullRequest[]): Promise<void> => {
  for (const pr of pullRequests) {
    const added = await addSkipCiLabel(pr.number);

    log(
      Result.isErr(added)
        ? `#${pr.number}: cannot put ${SKIP_CI_LABEL} on it: ${added.value}`
        : `#${pr.number}: put ${SKIP_CI_LABEL} on it; one queued pull request is released at a time.`,
    );
  }
};
