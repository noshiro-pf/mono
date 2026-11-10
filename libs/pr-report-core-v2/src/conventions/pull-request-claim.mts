/** The record `claim-pr` writes on a pull request someone is fixing. */

import { epochMsOf } from './instant.mjs';
import {
  CLAIM_CLOCK_SKEW_MS,
  firstLineOf,
  type ClaimComment,
} from './records.mjs';

export const writePullRequestClaimComment = (
  { headSha, by, at }: PullRequestClaim,
  prose: string,
): string =>
  [
    `${PULL_REQUEST_CLAIM} head=${headSha} by=${by} at=${at} -->`,
    '',
    prose.trim(),
  ].join('\n');

export const writeReleasedPullRequestClaimComment = (prose: string): string =>
  [`${PULL_REQUEST_CLAIM} released -->`, '', prose.trim()].join('\n');

export const parsePullRequestClaimComment = (
  body: string,
): ClaimComment<PullRequestClaim> | undefined => {
  const first = firstLineOf(body);

  if (first === `${PULL_REQUEST_CLAIM} released -->`) {
    return { kind: 'released' };
  }

  const groups = PULL_REQUEST_CLAIM_LINE.exec(first)?.groups;

  const headSha = groups?.['headSha'];

  const by = groups?.['by'];

  const at = groups?.['at'];

  return headSha === undefined || by === undefined || at === undefined
    ? undefined
    : { kind: 'standing', claim: { headSha, by, at } };
};

/**
 * Whether a pull request claim holds at `nowEpochMs` with the head at
 * `headSha`: the claimed head, from {@link CLAIM_CLOCK_SKEW_MS} before `at`
 * until {@link PULL_REQUEST_CLAIM_LIFETIME_MS} after.
 */
export const pullRequestClaimHolds = (
  claim: PullRequestClaim,
  headSha: string,
  nowEpochMs: number,
): boolean => {
  const at = epochMsOf(claim.at);

  return (
    claim.headSha === headSha &&
    at !== undefined &&
    at - CLAIM_CLOCK_SKEW_MS <= nowEpochMs &&
    nowEpochMs < at + PULL_REQUEST_CLAIM_LIFETIME_MS
  );
};

/** How long a pull request claim lasts when the head does not move first. */
export const PULL_REQUEST_CLAIM_LIFETIME_MS = 120 * 60_000;

export type PullRequestClaim = Readonly<{
  /** The head it was claimed at. */
  headSha: string;
  /** A session URL, or any other word unique to the claimant. */
  by: string;
  /** UTC, to the second. */
  at: string;
}>;

const PULL_REQUEST_CLAIM = '<!-- unblock-prs:claim';

const PULL_REQUEST_CLAIM_LINE =
  /^<!-- unblock-prs:claim head=(?<headSha>[0-9a-f]{40}) by=(?<by>[^\s>]+) at=(?<at>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) -->$/u;
