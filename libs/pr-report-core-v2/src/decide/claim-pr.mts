/**
 * What `claim-pr` does with a pull request (`spec/commands.md`, `claim-pr`):
 * claim it, release the claim, or refuse, and why.
 */

import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  pullRequestClaimHolds,
  type ClaimComment,
  type FoundRecord,
  type PullRequestClaim,
} from '../conventions/index.mjs';
import type { Read } from '../snapshot/index.mjs';
import type { QueueOwner } from './owner.mjs';
import { setAsideAtHead, type QueueComments } from './set-aside.mjs';

/**
 * Whether `by` may claim a pull request at `headSha`, as the queue read it:
 * only one a skill owns, and not one someone else's claim holds. The queue is
 * many seconds old by the time it is decided; {@link recheckPullRequestClaim}
 * checks the pull request read again just before the claim is written.
 */
export const decidePullRequestClaim = (
  {
    owner,
    comments,
  }: Readonly<{
    owner: Read<QueueOwner | undefined>;
    comments: Read<QueueComments>;
  }>,
  ask: Readonly<{ by: string; headSha: string }>,
): PullRequestClaimDecision => {
  const notSkills = notSkillsReason(owner);

  if (notSkills !== undefined) {
    return { kind: 'refuse', reason: notSkills };
  }

  // The owner is decided from the comments, so this is unread only with it.
  if (Result.isErr(comments)) {
    return {
      kind: 'refuse',
      reason: `its comments could not be read (${comments.value.what}: ${comments.value.message})`,
    };
  }

  const { claim, setAside } = comments.value;

  const held = holdingClaim(claim);

  if (held !== undefined && held.by !== ask.by) {
    return { kind: 'refuse', reason: `${held.by} claimed it at ${held.at}` };
  }

  return {
    kind: 'write',
    setAsideFor: setAsideAtHead(setAside?.says, ask.headSha)?.reason,
  };
};

/**
 * The claim {@link decidePullRequestClaim} allowed, checked against the pull
 * request read again just before it is written: still open, at the head it was
 * decided at, and held by no one else's claim written meanwhile. It is written
 * over the claim comment there is, holding or not, so that the oldest stays the
 * record.
 */
export const recheckPullRequestClaim = (
  fresh: Readonly<{
    open: boolean;
    headSha: string;
    comment: FoundRecord<ClaimComment<PullRequestClaim>> | undefined;
  }>,
  ask: Readonly<{ by: string; headSha: string; nowEpochMs: number }>,
): PullRequestClaimRecheck => {
  const moved = pullRequestMovedReason(fresh, ask.headSha);

  if (moved !== undefined) {
    return { kind: 'refuse', reason: moved };
  }

  const held = heldPullRequestClaim(
    fresh.comment?.says,
    fresh.headSha,
    ask.nowEpochMs,
  );

  return held !== undefined && held.by !== ask.by
    ? { kind: 'refuse', reason: `${held.by} claimed it at ${held.at}` }
    : { kind: 'write', commentId: fresh.comment?.commentId, held };
};

/**
 * Why no claim made at `headSha` can hold on the pull request as read now:
 * closed, or pushed to; `undefined` when neither.
 */
export const pullRequestMovedReason = (
  fresh: Readonly<{ open: boolean; headSha: string }>,
  headSha: string,
): string | undefined =>
  !fresh.open
    ? 'it is no longer open'
    : fresh.headSha === headSha
      ? undefined
      : (`its head moved to ${fresh.headSha} meanwhile` as const);

/**
 * The claim comment `by` gives up, holding or lapsed; nothing to release when
 * the claim is someone else's, released, or not there.
 */
export const decideReleasePullRequestClaim = (
  claim: FoundRecord<ClaimComment<PullRequestClaim>> | undefined,
  by: string,
): PullRequestReleaseDecision =>
  claim?.says.kind === 'standing' && claim.says.claim.by === by
    ? ({ kind: 'release', commentId: claim.commentId } as const)
    : ({ kind: 'none' } as const);

/**
 * The claim the queue read holds on a pull request at its head now (its
 * `applies`); `undefined` for none, a released one, or one that lapsed.
 */
export const holdingClaim = (
  claim: QueueComments['claim'],
): PullRequestClaim | undefined =>
  claim?.applies === true && claim.says.kind === 'standing'
    ? claim.says.claim
    : undefined;

/**
 * The claim a claim comment makes while it holds with the head at `headSha`;
 * `undefined` for none, a released one, a lapsed one, or one on another head.
 */
export const heldPullRequestClaim = (
  claim: ClaimComment<PullRequestClaim> | undefined,
  headSha: string,
  nowEpochMs: number,
): PullRequestClaim | undefined =>
  claim?.kind === 'standing' &&
  pullRequestClaimHolds(claim.claim, headSha, nowEpochMs)
    ? claim.claim
    : undefined;

/**
 * Why a pull request is not a skill's to claim or push, as its owner was read;
 * `undefined` when it is.
 */
export const notSkillsReason = (
  owner: Read<QueueOwner | undefined>,
): string | undefined =>
  Result.isErr(owner)
    ? (`who owns it could not be read (${owner.value.what}: ${owner.value.message})` as const)
    : owner.value === undefined
      ? 'it is not in the queue'
      : owner.value.owner === 'skill'
        ? undefined
        : (`it is ${WHOSE[owner.value.owner]} (${owner.value.reason}), not a skill's` as const);

export type PullRequestClaimDecision = Readonly<
  | {
      kind: 'write';
      /** The reason it stands set aside for at its head, which the prose names. */
      setAsideFor: string | undefined;
    }
  | { kind: 'refuse'; reason: string }
>;

export type PullRequestClaimRecheck = Readonly<
  | {
      kind: 'write';
      /** The claim comment to write over; a new one when `undefined`. */
      commentId: number | undefined;
      /** The claimant's own claim, if one holds: none else is written over. */
      held: PullRequestClaim | undefined;
    }
  | { kind: 'refuse'; reason: string }
>;

export type PullRequestReleaseDecision = Readonly<
  { kind: 'release'; commentId: number } | { kind: 'none' }
>;

/** Whose a pull request is, as a refusal says it. */
const WHOSE = {
  worker: "the worker's",
  skill: "a skill's",
  human: "a person's",
  none: "no one's, which is a bug",
} as const satisfies ReadonlyRecord<QueueOwner['owner'], string>;
