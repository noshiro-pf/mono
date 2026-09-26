/**
 * The pull requests picked last: ones a watch saw green and still open, held
 * by something no check reports and triage could not name.
 *
 * `review.mts` keeps the causes it can read — an owner's approval, an
 * unresolved conversation — from being picked at all. What is left is a pull
 * request whose checks all passed and which did not merge for a reason
 * nothing here can see, and the likeliest thing about it is that it will not
 * merge next time either. A `not-merging` skip record already keeps it from
 * being picked until the base moves; the base moving is what makes it
 * `BEHIND` again, and without this it would then be rebased first, run a full
 * matrix, and sit green once more ahead of everything behind it.
 *
 * So it is picked after everything else, the version pull request included,
 * rather than not at all: a demotion is a guess, and the guess is wrong for
 * a pull request that was waiting on something which has since cleared.
 */

import {
  type Demotions,
  type PullRequest,
  type WatchOutcome,
} from './types.mjs';

/**
 * Whether the pull request is demoted. A head other than the one recorded is
 * someone else's push — this run's own pushes move the record with them, see
 * {@link followHead} — and a push is the author doing something about it.
 */
export const isDemoted = (demoted: Demotions, pr: PullRequest): boolean =>
  demoted.get(pr.number) === pr.headRefOid;

/**
 * What a watch that ended on `head` leaves demoted: the pull request itself
 * if it sat green without merging, and otherwise whatever was demoted before,
 * carried to the head the watch ended on.
 */
export const afterWatch = (
  demoted: Demotions,
  prNumber: number,
  head: string,
  outcome: WatchOutcome,
): Demotions =>
  outcome === 'not-merging'
    ? new Map([...demoted, [prNumber, head]])
    : followHead(demoted, prNumber, head);

/**
 * Carries a demotion to a head this run pushed. A rebase is not the author
 * doing anything, so it must not read as one on the next survey.
 */
export const followHead = (
  demoted: Demotions,
  prNumber: number,
  head: string,
): Demotions =>
  demoted.has(prNumber) ? new Map([...demoted, [prNumber, head]]) : demoted;

/**
 * Drops demotions of pull requests that are gone or that someone else has
 * pushed to. The base moving is deliberately not among them — see the top
 * of this file.
 */
export const pruneDemotions = (
  demoted: Demotions,
  pullRequests: readonly PullRequest[],
): Demotions =>
  new Map(
    pullRequests.flatMap((pr) =>
      isDemoted(demoted, pr) ? [[pr.number, pr.headRefOid] as const] : [],
    ),
  );
