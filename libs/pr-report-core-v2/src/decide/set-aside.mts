// cspell:ignore unlabel

/**
 * The set-aside reasons and when a set-aside stands (`spec/decisions.md`,
 * "Set-aside reasons").
 */

import {
  findRecord,
  parsePullRequestClaimComment,
  parseSetAsideComment,
  pullRequestClaimHolds,
  type ClaimComment,
  type FoundRecord,
  type OwnCommentBody,
  type PullRequestClaim,
  type SetAsideComment,
  type SetAsideRecord,
} from '../conventions/index.mjs';

export const isSetAsideReason = (reason: string): reason is SetAsideReason =>
  KNOWN_REASONS.has(reason);

/**
 * Whether a pull request set aside at `record` is still set aside with its head
 * at `headSha` and its base at `baseTip`: the worker's rule for settling the
 * comment. A push clears every reason; the base moving clears all but
 * {@link survivesBaseMove}.
 */
export const setAsideApplies = (
  record: SetAsideRecord,
  headSha: string,
  baseTip: string,
): boolean =>
  record.headSha === headSha && setAsideStillApplies(record, baseTip);

/**
 * The record of a set-aside comment that stands at `headSha` with no retry
 * asked for, if it does: what the owner reads (the base is not), and the head
 * half of what the worker settles by.
 */
export const setAsideAtHead = (
  comment: SetAsideComment | undefined,
  headSha: string,
): SetAsideRecord | undefined =>
  comment?.kind === 'standing' &&
  !comment.retry &&
  comment.record.headSha === headSha
    ? comment.record
    : undefined;

/** The base half of {@link setAsideApplies}. */
export const setAsideStillApplies = (
  record: Readonly<{ reason: string; baseSha: string }>,
  baseTip: string,
): boolean => survivesBaseMove(record.reason) || record.baseSha === baseTip;

/**
 * Whether a reason stands when the base moves: a failure a rebase would only
 * put through the same matrix again (`checks-failed`), one waiting on a bypass
 * merge, and GitHub not having taken in the last push.
 */
export const survivesBaseMove = (reason: string): boolean =>
  reason === 'checks-failed' ||
  reason === 'awaiting-bypass' ||
  reason === 'head-out-of-sync';

/** The set-aside and the claim among `comments`, this account's, oldest first. */
export const readQueueComments = (
  comments: readonly OwnCommentBody[],
  state: Readonly<{
    headSha: string;
    /** The tip of the default branch. */
    baseTip: string;
    nowEpochMs: number;
  }>,
): QueueComments => {
  const setAside = findRecord(comments, parseSetAsideComment);

  const claim = findRecord(comments, parsePullRequestClaimComment);

  return {
    setAside:
      setAside === undefined
        ? undefined
        : {
            ...setAside,
            applies: isAppliedAt(
              setAsideAtHead(setAside.says, state.headSha),
              state.baseTip,
            ),
          },
    claim:
      claim === undefined
        ? undefined
        : {
            ...claim,
            applies:
              claim.says.kind === 'standing' &&
              pullRequestClaimHolds(
                claim.says.claim,
                state.headSha,
                state.nowEpochMs,
              ),
          },
  };
};

/** Every reason the worker writes into a set-aside comment. */
export const SET_ASIDE_REASONS = [
  'already-in-base',
  'arm-failed',
  'awaiting-bypass',
  'checks-failed',
  'checks-not-started',
  'head-out-of-sync',
  'not-merging',
  'push-failed',
  'read-failed',
  'rebase-failed',
  'unlabel-failed',
  'watch-timeout',
] as const;

export type SetAsideReason = (typeof SET_ASIDE_REASONS)[number];

/** A record found on a pull request, and whether it holds now. */
export type QueueComment<A> = FoundRecord<A> &
  Readonly<{
    /**
     * For the set-aside, whether the worker leaves the pull request alone:
     * standing, applying at the head and base it is at now, no retry asked for.
     * For the claim, whether it holds.
     */
    applies: boolean;
  }>;

export type QueueComments = Readonly<{
  setAside: QueueComment<SetAsideComment> | undefined;
  claim: QueueComment<ClaimComment<PullRequestClaim>> | undefined;
}>;

const KNOWN_REASONS: ReadonlySet<string> = new Set<string>(SET_ASIDE_REASONS);

const isAppliedAt = (
  record: SetAsideRecord | undefined,
  baseTip: string,
): boolean => record !== undefined && setAsideStillApplies(record, baseTip);
