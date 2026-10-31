/**
 * Who moves each pull request next, as the worker reads it: `pr-report-core`'s
 * `queueOwner`, the one function `pr-report`, `claim-pr` and every other
 * command a session runs read it through, given the facts GitHub returned.
 *
 * The set-aside comes from the records, which by the time triage reads them are
 * what this account's comments say (`settleSkips`): a record the base moved
 * under is pruned as its comment is rewritten as resolved, and one an earlier
 * run left is taken up from its comment. The claims are the ones that still
 * hold (`claims.mts`).
 */

import { queueOwner, type Claim, type QueueOwner } from 'pr-report-core';
import type { Classification, PullRequest, SkipRecords } from './types.mjs';

export type OwnerContext = Readonly<{
  defaultBranch: string;
  skipped: SkipRecords;
  claimed: ReadonlyMap<number, Claim>;
  /** Which open pull request each stacked one is on: child → parent. */
  stackParents: ReadonlyMap<number, number>;
  /** Every number that sits on a `Merge-After` cycle. */
  cyclic: ReadonlySet<number>;
  nowEpochMs: number;
}>;

/** Who moves `pr` next, or `undefined` outside the queue. */
export const ownerOf = (
  pr: PullRequest,
  context: OwnerContext,
): QueueOwner | undefined => {
  const skip = context.skipped.get(pr.number);

  const claim = context.claimed.get(pr.number);

  return queueOwner({
    number: pr.number,
    labels: pr.labels.map(({ name }) => name),
    isDraft: pr.isDraft,
    fromFork: pr.isCrossRepository,
    headRef: pr.headRefName,
    headSha: pr.headRefOid,
    baseRef: pr.baseRefName,
    defaultBranch: context.defaultBranch,
    stackedOn: context.stackParents.get(pr.number),
    inCycle: context.cyclic.has(pr.number),
    setAside:
      skip === undefined
        ? undefined
        : {
            kind: 'standing',
            setAside: {
              reason: skip.reason,
              headSha: skip.headSha,
              baseSha: skip.baseSha,
            },
            retry: false,
          },
    claim: claim === undefined ? undefined : { kind: 'standing', claim },
    nowEpochMs: context.nowEpochMs,
  });
};

/**
 * What triage says about a pull request that is not the worker's to move: a
 * note naming its owner and why, with the record's detail when one set it
 * aside. `undefined` for one the worker moves, or one outside the queue.
 */
export const ownerNote = (
  pr: PullRequest,
  owner: QueueOwner | undefined,
  skipped: SkipRecords,
): Classification | undefined => {
  if (owner === undefined || owner.owner === 'worker') {
    return undefined;
  }

  const skip = skipped.get(pr.number);

  const whose =
    owner.owner === 'skill'
      ? "the /unblock-prs skill's"
      : owner.owner === 'human'
        ? "a person's"
        : "nobody's — a bug";

  return {
    kind: 'note',
    note: `#${pr.number}: ${whose} (${owner.reason})${skip === undefined ? '' : `; set aside: ${skip.detail}`}`,
  };
};
