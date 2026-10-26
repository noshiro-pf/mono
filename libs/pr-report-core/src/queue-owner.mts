// cspell:ignore unlabel retarget

/**
 * Who is to move each pull request in the queue next: the worker
 * (`pnpm run unblock-prs`), a skill, a person, or — which is a bug — nobody.
 *
 * The worker and the `/unblock-prs` skill move the same queue side by side
 * and cannot see each other. Each used to decide for itself whether a
 * set-aside still stood, from its own reading of the tip of the default
 * branch, and when the two readings differed each left the pull request to
 * the other (#2267). So the answer is decided here, once, and every reader
 * asks this function: the worker before it acts, `pr-report` for the skill,
 * `claim-pr` before it lets a claim be written, and `report-unowned-prs` to
 * turn `none` into an issue.
 *
 * **It reads the comments and the pull request, never the tip of the base.**
 * The set-aside comment is the hand-off: it stands until the worker rewrites
 * it as resolved — when the head moves, when a retry is asked for, or, for a
 * reason tied to the base, when the base moves and the worker takes the pull
 * request back to try again. Until then it is the skill's or a person's, and
 * a worker that has stopped running leaves it so rather than nobody's.
 *
 * **Every reason the worker sets aside for has an owner**
 * ({@link setAsideOwner}, exhaustive over {@link SET_ASIDE_REASONS}), so `none`
 * is only ever a combination nothing here expected: a reason this module
 * does not know, written by a worker newer than the reader.
 */

import { claimApplies, type ClaimComment } from './claim.mjs';
import {
  AUTO_REBASE_LABEL,
  MERGE_QUEUED_LABEL,
  SKIP_CI_LABEL,
} from './labels.mjs';
import type { QueueComments } from './queue-comments.mjs';
import type { SetAside, SetAsideComment } from './set-aside.mjs';
import type { ReportEntry } from './types.mjs';

export const QUEUE_OWNERS = ['worker', 'skill', 'human', 'none'] as const;

/**
 * `skill` is the `/unblock-prs` skill, which fixes every queued pull request
 * the worker sets aside — the dependency update's (`chore/pnpm-update`)
 * included.
 */
export type QueueOwner = Readonly<{
  owner: 'human' | 'none' | 'skill' | 'worker';
  reason: string;
}>;

/** Every reason the worker writes into a set-aside comment. */
export const SET_ASIDE_REASONS = [
  'already-in-base',
  'arm-failed',
  'awaiting-bypass',
  'checks-failed',
  'not-merging',
  'push-failed',
  'rebase-failed',
  'unlabel-failed',
  'watch-timeout',
] as const;

export type SetAsideReason = (typeof SET_ASIDE_REASONS)[number];

/**
 * Whose a pull request set aside for `reason` is, while the comment stands
 * at its head. A skill's reason is one a session can fix by pushing: a
 * conflict to resolve, a failure to reproduce. A person's is one only a
 * setting, a permission, a review or a merge by hand clears, and the comment
 * says which. A `switch` with no default, so a reason added to
 * {@link SET_ASIDE_REASONS} without an owner fails to compile.
 */
const setAsideOwner = (
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

    case 'not-merging':
      return {
        owner: 'human',
        why: 'green but not merging; something the worker cannot read holds it',
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

/** What {@link queueOwner} reads about one pull request. */
export type QueueOwnerInput = Readonly<{
  number: number;
  labels: readonly string[];
  isDraft: boolean;
  fromFork: boolean;
  headRef: string;
  headSha: string;
  baseRef: string;
  defaultBranch: string;
  /** The open pull request whose branch this one is on, if any. */
  stackedOn: number | undefined;
  /** Whether it sits on a `Merge-After` cycle. */
  inCycle: boolean;
  /** This account's set-aside comment on it (`set-aside.mts`). */
  setAside: SetAsideComment | undefined;
  /** This account's claim comment on it (`claim.mts`). */
  claim: ClaimComment | undefined;
  nowEpochMs: number;
}>;

/**
 * Who moves `pr` next, or `undefined` for a pull request the queue does not
 * cover: neither `merge-queued` nor `auto-rebase` under `skip-ci`.
 */
export const queueOwner = (pr: QueueOwnerInput): QueueOwner | undefined => {
  const queued = pr.labels.includes(MERGE_QUEUED_LABEL);

  if (
    !queued &&
    !(
      pr.labels.includes(AUTO_REBASE_LABEL) && pr.labels.includes(SKIP_CI_LABEL)
    )
  ) {
    return undefined;
  }

  if (
    pr.claim?.kind === 'standing' &&
    claimApplies(pr.claim.claim, pr.headSha, pr.nowEpochMs)
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

  // A layer waits for the one below whatever it says, and the worker carries
  // it along when that one moves.
  if (pr.stackedOn !== undefined) {
    return {
      owner: 'worker',
      reason: `stacked on #${pr.stackedOn}; the worker carries it along`,
    };
  }

  const setAside = standingAt(pr.setAside, pr.headSha);

  if (setAside === undefined) {
    return {
      owner: 'worker',
      reason: queued
        ? 'in the queue; the worker picks it in its turn'
        : 'auto-rebase; the worker keeps it on the tip',
    };
  }

  if (!isSetAsideReason(setAside.reason)) {
    return {
      owner: 'none',
      reason: `set aside for \`${setAside.reason}\`, a reason no owner is defined for; a bug in unblock-prs or pr-report-core`,
    };
  }

  const { owner, why } = setAsideOwner(setAside.reason);

  const said = `set aside \`${setAside.reason}\` at its head` as const;

  if (owner === 'human') {
    return { owner, reason: `${said}: ${why}` };
  }

  const handedOff = skillHandOff(pr, setAside.reason, queued);

  return handedOff === undefined
    ? {
        owner: 'skill',
        reason:
          setAside.reason === 'rebase-failed' && isPnpmUpdate(pr)
            ? `${said}; the skill has \`pnpm-update.yml\` rebuild it from main`
            : `${said}; ${why}`,
      }
    : { owner: 'human', reason: `${said}: ${handedOff}` };
};

/**
 * {@link queueOwner} for an entry of the report, with what this account's
 * comments on it say. `pr-report` and every command a session runs read the
 * owner through here, and the worker reads it through {@link queueOwner} with
 * the same facts from `gh`.
 */
export const queueOwnerOfEntry = (
  entry: ReportEntry,
  comments: QueueComments,
  context: Readonly<{
    defaultBranch: string;
    cycles: readonly (readonly number[])[];
    nowEpochMs: number;
  }>,
): QueueOwner | undefined =>
  queueOwner({
    number: entry.number,
    labels: entry.labels.map(({ name }) => name),
    isDraft: entry.isDraft,
    fromFork: entry.fromFork,
    headRef: entry.headRef,
    headSha: entry.headSha,
    baseRef: entry.baseRef,
    defaultBranch: context.defaultBranch,
    stackedOn: entry.stackedOn,
    inCycle: context.cycles.some((cycle) => cycle.includes(entry.number)),
    setAside: comments.setAside?.says,
    claim: comments.claim?.says,
    nowEpochMs: context.nowEpochMs,
  });

/**
 * The set-aside `comment` says, if it stands at `headSha` with no retry
 * asked for. The base is not read: see the module comment.
 */
const standingAt = (
  comment: SetAsideComment | undefined,
  headSha: string,
): SetAside | undefined =>
  comment?.kind === 'standing' &&
  !comment.retry &&
  comment.setAside.headSha === headSha
    ? comment.setAside
    : undefined;

export const isSetAsideReason = (reason: string): reason is SetAsideReason =>
  KNOWN_REASONS.has(reason);

const KNOWN_REASONS: ReadonlySet<string> = new Set(SET_ASIDE_REASONS);

/**
 * The dependency update, which `pnpm-update.yml` builds from the default
 * branch: a conflict on it is resolved by building it again, not by a rebase.
 */
export const PNPM_UPDATE_BRANCH = 'chore/pnpm-update';

const isPnpmUpdate = (pr: QueueOwnerInput): boolean =>
  pr.headRef === PNPM_UPDATE_BRANCH;

/**
 * Why nothing in the queue can move `pr` until a person does something, if
 * so: the worker passes these over with a note, and no skill takes them up.
 */
const unmovableReason = (pr: QueueOwnerInput): string | undefined =>
  pr.isDraft
    ? 'a draft; mark it ready for review'
    : pr.fromFork
      ? 'a branch in a fork, which nothing here pushes to'
      : pr.inCycle
        ? 'on a `Merge-After` cycle; break it in one of the bodies'
        : pr.baseRef !== pr.defaultBranch && pr.stackedOn === undefined
          ? (`based on ${pr.baseRef}, neither ${pr.defaultBranch} nor an open pull request's branch; retarget it` as const)
          : undefined;

/**
 * Why a skill's reason goes to a person instead: the version pull request,
 * which `release.yml` rebuilds and no session pushes to, and a failure on one
 * no longer queued, whose checks are nobody's business until it is.
 */
const skillHandOff = (
  pr: QueueOwnerInput,
  reason: SetAsideReason,
  queued: boolean,
): string | undefined =>
  pr.headRef === `changeset-release/${pr.defaultBranch}`
    ? 'the version pull request, which `release.yml` rebuilds; look at the run'
    : reason === 'checks-failed' && !queued
      ? 'no longer queued; queue it again to have it fixed'
      : undefined;
