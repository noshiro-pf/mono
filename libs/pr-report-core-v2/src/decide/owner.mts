// cspell:ignore unlabel retarget

/**
 * Who moves each pull request in the queue next (`spec/decisions.md`, "Queue
 * owner"). Decided from the pull request and this account's comments only,
 * never from the tip of the base (#2267): the set-aside comment is the hand-off,
 * and stands until the worker resolves it.
 */

import {
  hasLabel,
  isVersionBranch,
  pullRequestClaimHolds,
  PullRequestLabel,
  type ClaimComment,
  type PullRequestClaim,
  type SetAsideComment,
} from '../conventions/index.mjs';
import {
  isSetAsideReason,
  setAsideAtHead,
  type SetAsideReason,
} from './set-aside.mjs';

/**
 * Who moves `pr` next, or `undefined` for a pull request the queue does not
 * cover: neither `merge-queued` nor `auto-rebase` with `skip-ci`.
 */
export const queueOwner = (pr: OwnerFacts): QueueOwner | undefined => {
  const queued = hasLabel(pr.labels, PullRequestLabel.mergeQueued);

  const autoRebased =
    hasLabel(pr.labels, PullRequestLabel.autoRebase) &&
    hasLabel(pr.labels, PullRequestLabel.skipCi);

  if (!queued && !autoRebased) {
    return undefined;
  }

  if (
    pr.claim?.kind === 'standing' &&
    pullRequestClaimHolds(pr.claim.claim, pr.headSha, pr.nowEpochMs)
  ) {
    return {
      owner: 'skill',
      reason: `claimed by ${pr.claim.claim.by} at ${pr.claim.claim.at}`,
    };
  }

  const unmovable = unmovableReason(pr);

  if (unmovable !== undefined) {
    return { owner: 'human', reason: unmovable };
  }

  if (pr.stackedOn !== undefined) {
    return {
      owner: 'worker',
      reason: `stacked on #${pr.stackedOn}; the worker carries it along`,
    };
  }

  const reason = setAsideAtHead(pr.setAside, pr.headSha)?.reason;

  if (reason === undefined) {
    return {
      owner: 'worker',
      reason: queued
        ? 'in the queue; the worker picks it in its turn'
        : 'auto-rebase; the worker keeps it on the tip',
    };
  }

  if (!isSetAsideReason(reason)) {
    return {
      owner: 'none',
      reason: `set aside for \`${reason}\`, a reason no owner is defined for; a bug in unblock-prs or pr-report-core`,
    };
  }

  const { owner, why } = ownerOfReason(reason);

  const said = `set aside \`${reason}\` at its head` as const;

  if (owner === 'human') {
    return { owner, reason: `${said}: ${why}` };
  }

  const handedOff = skillHandOff(pr, reason, queued);

  return handedOff === undefined
    ? { owner: 'skill', reason: `${said}; ${why}` }
    : { owner: 'human', reason: `${said}: ${handedOff}` };
};

/**
 * Whose a reason is while it stands. A `switch` with no default, so a reason
 * added without an owner fails to compile.
 */
export const ownerOfReason = (
  reason: SetAsideReason,
): Readonly<{ owner: 'human' | 'skill'; why: string }> => {
  switch (reason) {
    case 'checks-failed':
    case 'rebase-failed':
      return { owner: 'skill', why: 'the skill fixes it' };

    case 'already-in-base':
      return {
        owner: 'human',
        why: 'every commit is already in the base; close it',
      };

    case 'arm-failed':
      return {
        owner: 'human',
        why: 'auto-merge could not be armed; a setting or a permission holds it',
      };

    case 'awaiting-bypass':
      return {
        owner: 'human',
        why: 'green, and only a ruleset bypass merges it',
      };

    case 'checks-not-started':
      return {
        owner: 'human',
        why: 'GitHub started no run for a required check on its head; the base moving puts it back in the queue to be rebased in its turn, and a new commit pushed to the branch starts the checks sooner',
      };

    case 'head-out-of-sync':
      return {
        owner: 'human',
        why: 'GitHub never took in the last push to its branch, so it still shows an older head; push to the branch again, or close and reopen it',
      };

    case 'not-merging':
      return {
        owner: 'human',
        why: 'green but not merging; something a rebase cannot fix holds it',
      };

    case 'read-failed':
      return {
        owner: 'human',
        why: 'its checks or its base could not be read survey after survey; the comment says what failed',
      };

    case 'push-failed':
      return {
        owner: 'human',
        why: 'the push was refused; a setting or a permission holds it',
      };

    case 'unlabel-failed':
      return {
        owner: 'human',
        why: '`skip-ci` could not be taken off; a permission holds it',
      };

    case 'watch-timeout':
      return {
        owner: 'human',
        why: 'its checks ran past the watch; look at the run',
      };
  }
};

export const QUEUE_OWNERS = ['worker', 'skill', 'human', 'none'] as const;

/**
 * `skill` is the `/unblock-prs` skill; `none` is a combination the tooling did
 * not expect, which `report-unowned-prs` files as a bug.
 */
export type QueueOwner = Readonly<{
  owner: (typeof QUEUE_OWNERS)[number];
  reason: string;
}>;

/** What {@link queueOwner} reads of one pull request. */
export type OwnerFacts = Readonly<{
  labels: readonly string[];
  isDraft: boolean;
  fromFork: boolean;
  headRef: string;
  headSha: string;
  baseRef: string;
  defaultBranch: string;
  /** The open pull request it is stacked on. */
  stackedOn: number | undefined;
  inCycle: boolean;
  /** This account's set-aside comment on it. */
  setAside: SetAsideComment | undefined;
  /** This account's claim comment on it. */
  claim: ClaimComment<PullRequestClaim> | undefined;
  nowEpochMs: number;
}>;

/** Why nothing in the queue can move `pr` until a person acts, if so. */
const unmovableReason = (pr: OwnerFacts): string | undefined =>
  pr.isDraft
    ? 'a draft; mark it ready for review'
    : pr.fromFork
      ? 'a branch in a fork, which nothing here pushes to'
      : pr.inCycle
        ? 'on a merge-order cycle (a stack, `Merge-After:`, or the `Start-After:` or "blocked by" of an issue a pull request closes); break one of them'
        : pr.baseRef !== pr.defaultBranch && pr.stackedOn === undefined
          ? (`based on ${pr.baseRef}, neither ${pr.defaultBranch} nor an open pull request's branch; retarget it` as const)
          : undefined;

/**
 * Why a skill's reason goes to a person: the version pull request, which
 * `release.yml` rebuilds, and a failure on one no longer queued.
 */
const skillHandOff = (
  pr: OwnerFacts,
  reason: SetAsideReason,
  queued: boolean,
): string | undefined =>
  isVersionBranch(pr.headRef, pr.defaultBranch)
    ? 'the version pull request, which `release.yml` rebuilds; look at the run'
    : reason === 'checks-failed' && !queued
      ? 'no longer queued; queue it again to have it fixed'
      : undefined;
