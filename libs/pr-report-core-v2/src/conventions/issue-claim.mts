/** The record `start-issue` writes on an issue someone started or plans to. */

import { epochMsOf } from './instant.mjs';
import {
  CLAIM_CLOCK_SKEW_MS,
  firstLineOf,
  type ClaimComment,
} from './records.mjs';

export const writeIssueClaimComment = (
  { state, by, at }: IssueClaim,
  prose: string,
): string =>
  [
    `${ISSUE_CLAIM} state=${state} by=${by} at=${at} -->`,
    '',
    prose.trim(),
  ].join('\n');

export const writeReleasedIssueClaimComment = (prose: string): string =>
  [`${ISSUE_CLAIM} released -->`, '', prose.trim()].join('\n');

export const parseIssueClaimComment = (
  body: string,
): ClaimComment<IssueClaim> | undefined => {
  const first = firstLineOf(body);

  if (first === `${ISSUE_CLAIM} released -->`) {
    return { kind: 'released' };
  }

  const groups = ISSUE_CLAIM_LINE.exec(first)?.groups;

  const state = groups?.['state'];

  const by = groups?.['by'];

  const at = groups?.['at'];

  return by === undefined ||
    at === undefined ||
    (state !== 'planned' && state !== 'started')
    ? undefined
    : { kind: 'standing', claim: { state, by, at } };
};

/**
 * Whether an issue claim holds at `nowEpochMs`: from
 * {@link CLAIM_CLOCK_SKEW_MS} before `at`, a `started` one until released, a
 * `planned` one for {@link PLANNED_ISSUE_CLAIM_LIFETIME_MS}.
 */
export const issueClaimHolds = (
  claim: IssueClaim,
  nowEpochMs: number,
): boolean => {
  const at = epochMsOf(claim.at);

  return (
    at !== undefined &&
    at - CLAIM_CLOCK_SKEW_MS <= nowEpochMs &&
    (claim.state === 'started' ||
      nowEpochMs < at + PLANNED_ISSUE_CLAIM_LIFETIME_MS)
  );
};

/** How long a `planned` issue claim lasts when it is not written again. */
export const PLANNED_ISSUE_CLAIM_LIFETIME_MS = 24 * 60 * 60_000;

export type IssueClaim = Readonly<{
  state: 'planned' | 'started';
  by: string;
  at: string;
}>;

const ISSUE_CLAIM = '<!-- start-issue:claim';

const ISSUE_CLAIM_LINE =
  /^<!-- start-issue:claim state=(?<state>planned|started) by=(?<by>[^\s>]+) at=(?<at>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) -->$/u;
