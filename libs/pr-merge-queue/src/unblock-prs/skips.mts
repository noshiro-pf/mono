/**
 * What the loop remembers about a pull request it has given up on, and for
 * how long.
 */

import {
  isSetAsideReason,
  setAsideApplies,
  setAsideStillApplies,
  type SetAside,
} from 'pr-report-core';
import { Arr } from 'ts-data-forge';
import type { ResolvedBy } from './set-aside-comment.mjs';
import type {
  OwnSetAsideComment,
  PullRequest,
  SkipRecord,
  SkipRecords,
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
 * clears it. Nor is `awaiting-bypass`: the bypass merge it waits for does not
 * wait for the base, and a rebase each time anything else merged would run
 * the matrix again for nothing. Its comment's retry box is how a person asks
 * for a run on the current tip.
 *
 * The rule is `pr-report-core`'s `setAsideApplies`, because the Pull Requests
 * Manager page applies the same rule to the comment this script leaves on
 * the pull request, and so does {@link settleSkips} here.
 */
export const skipStillApplies = (
  skip: SkipRecord,
  pr: PullRequest,
  baseSha: string,
): boolean => setAsideApplies(skip, pr.headRefOid, baseSha);

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
  new Map<number, SkipRecord>([...skipped, [skip.number, skip]]);

/**
 * The records in `after` that `before` did not have — a pull request newly
 * set aside, or set aside again for a different reason or in a different
 * state. What the loop writes to GitHub, once each, rather than on every
 * survey that finds the same record standing.
 *
 * `before` is what the cycle acted from, after {@link settleSkips}, so that a
 * record read back from a comment is not written over that comment again.
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

/**
 * The records no comment says: never written, because the write failed, or
 * written over since. Until it is written the worker holds the pull request
 * aside while every other reader of the queue (`owner.mts`) reads it as the
 * worker's, and each leaves it to the other; so the loop writes these again.
 */
export const unannouncedSkips = (
  skipped: SkipRecords,
  comments: ReadonlyMap<number, OwnSetAsideComment>,
): readonly SkipRecord[] =>
  Array.from(skipped.values()).filter((skip) => {
    const says = comments.get(skip.number)?.says;

    return (
      says?.kind !== 'standing' ||
      says.setAside.headSha !== skip.headSha ||
      says.setAside.reason !== skip.reason
    );
  });

/**
 * What this account's set-aside comments on the open pull requests say, laid
 * over the records: the comments to rewrite as resolved, and the records to
 * act from.
 *
 * - **Ended**: a comment set aside at a head that has moved, or against a
 *   base that has — by the same rule as the records, {@link skipStillApplies}
 *   — is rewritten as resolved.
 * - **Retry**: a comment whose box a person ticked is rewritten as resolved,
 *   and the record goes with it, so this cycle's triage treats the pull
 *   request as if it had never been set aside. One that fails again is set
 *   aside again, and its comment says so again.
 * - **Standing, and this run does not know it**: a record an earlier run
 *   reached, which is taken up as it stands rather than tried again — a
 *   rebase that conflicted would conflict the same way.
 *
 * A record this run holds is left as it is otherwise: the comment says what
 * the record said when it was written.
 */
export const settleSkips = (
  skipped: SkipRecords,
  comments: ReadonlyMap<number, OwnSetAsideComment>,
  pullRequests: readonly PullRequest[],
  baseSha: string,
): Readonly<{ skipped: SkipRecords; resolved: readonly Resolution[] }> => {
  const judged = Array.from(comments).flatMap(([number, comment]) => {
    const pr = pullRequests.find((p) => p.number === number);

    if (pr === undefined || comment.says.kind === 'resolved') {
      return [];
    }

    const { setAside, retry } = comment.says;

    const resolvedBy: ResolvedBy | undefined =
      setAside.headSha !== pr.headRefOid
        ? 'pushed'
        : !setAsideStillApplies(setAside, baseSha)
          ? 'base-moved'
          : retry
            ? 'retry'
            : undefined;

    return [
      { number, databaseId: comment.databaseId, setAside, resolvedBy } as const,
    ];
  });

  const retried = new Set(
    Arr.generate(function* () {
      for (const { number, resolvedBy } of judged) {
        if (resolvedBy === 'retry') {
          yield number;
        }
      }
    }),
  );

  const taken = Arr.generate(function* () {
    for (const { number, setAside, resolvedBy } of judged) {
      if (
        resolvedBy === undefined &&
        !skipped.has(number) &&
        isSetAsideReason(setAside.reason)
      ) {
        yield {
          number,
          headSha: setAside.headSha,
          baseSha: setAside.baseSha,
          reason: setAside.reason,
          detail: TAKEN_UP_DETAIL,
        } as const;
      }
    }
  });

  return {
    skipped: taken.reduce(
      withSkip,
      new Map(Array.from(skipped).filter(([number]) => !retried.has(number))),
    ),
    resolved: Arr.generate(function* () {
      for (const { number, databaseId, setAside, resolvedBy } of judged) {
        if (resolvedBy !== undefined) {
          yield { number, databaseId, setAside, resolvedBy };
        }
      }
    }),
  };
};

/** A set-aside comment to rewrite as resolved, and why. */
export type Resolution = Readonly<{
  number: number;
  databaseId: number;
  setAside: SetAside;
  resolvedBy: ResolvedBy;
}>;

/** What the log says about a record taken up from a comment. */
const TAKEN_UP_DETAIL = 'set aside by an earlier run, as its comment says';
