/**
 * What the loop remembers about a pull request it has given up on, and for
 * how long.
 */

import { setAsideStillApplies } from 'pr-report-core';
import {
  type PullRequest,
  type SkipRecord,
  type SkipRecords,
} from './types.mjs';

/**
 * A verdict lasts as long as the state it was reached in. Every reason is
 * tied to the head, so a push to the branch clears it; all but
 * `checks-failed` are tied to the base as well.
 *
 * The base is what makes the difference to a pull request that sat green
 * without merging or ran out of watch time: once the base moves that pull
 * request is `BEHIND`, which is the one thing this script knows how to fix,
 * and a verdict that outlived its state is what left a ready pull request
 * sitting still through cycle after cycle of "Nothing to do". One that sat
 * green goes back in the running last, not first — `demotions.mts`. A rebase or
 * push failure is tied to the base for the older reason: the commit it
 * conflicted with may have gone with it.
 *
 * `checks-failed` is deliberately not tied to the base. Rebasing it would put
 * the same failing matrix through again, and fixing the failure is the
 * skill's job, not this script's — the push that carries the fix is what
 * clears it.
 *
 * The base half is `pr-report-core`'s `setAsideStillApplies`, because the
 * Pull Requests Manager page applies the same rule to the status this script
 * leaves on the pull request.
 */
export const skipStillApplies = (
  skip: SkipRecord,
  pr: PullRequest,
  baseSha: string,
): boolean =>
  skip.headSha === pr.headRefOid && setAsideStillApplies(skip, baseSha);

/** Drops records for pull requests that are gone or have moved on. */
export const pruneSkips = (
  skipped: SkipRecords,
  pullRequests: readonly PullRequest[],
  baseSha: string,
): SkipRecords =>
  new Map(
    Array.from(skipped.values())
      .filter((skip) => {
        const pr = pullRequests.find((p) => p.number === skip.number);

        return pr !== undefined && skipStillApplies(skip, pr, baseSha);
      })
      .map((skip) => [skip.number, skip] as const),
  );

export const withSkip = (skipped: SkipRecords, skip: SkipRecord): SkipRecords =>
  new Map([...skipped, [skip.number, skip]]);

/**
 * The records in `after` that `before` did not have — a pull request newly
 * set aside, or set aside again for a different reason or in a different
 * state. What the loop writes to GitHub, once each, rather than on every
 * survey that finds the same record standing.
 */
export const newSkips = (
  before: SkipRecords,
  after: SkipRecords,
): readonly SkipRecord[] =>
  Array.from(after.values()).filter((skip) => {
    const previous = before.get(skip.number);

    return (
      previous?.headSha !== skip.headSha ||
      previous.baseSha !== skip.baseSha ||
      previous.reason !== skip.reason
    );
  });
