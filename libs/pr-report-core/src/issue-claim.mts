/**
 * Who has started an issue, or means to, written where every session can read
 * it.
 *
 * The `in-progress` and `planned` labels (`labels.mts`) say that someone is on
 * an issue, not who: every session writes as the same account, so neither the
 * labels nor the assignees tell two of them apart, and a session refused by a
 * label cannot say whose it is. So `start-issue` also writes a comment whose
 * first line is a hidden record this module writes and reads, naming the
 * claimant (a session URL, or any other word unique to it; `claim.mts`'s
 * `isClaimant`).
 *
 * **A start lasts until it is released**, as the label always has: the pull
 * request that closes the issue is what ends it. **A plan lapses** after
 * {@link PLANNED_CLAIM_LIFETIME_HOURS}, since it holds nothing back and a
 * session that meant to start next may never get there; a claimant still
 * meaning to writes it again.
 *
 * **One comment per issue, edited in place**, as for the pull request claim; of
 * several, the oldest is the one, so two claimants writing at once both read
 * back the same answer — which a label cannot give, having no order to read.
 *
 * **Only the comments the reader's own account wrote count**: the repository is
 * public.
 */

import { CLOCK_SKEW_MINUTES } from './claim.mjs';
import type { OwnComment, QueueComment } from './queue-comments.mjs';
import { epochMsOf } from './timestamp.mjs';

/** How long a plan lasts when it is not written again. */
export const PLANNED_CLAIM_LIFETIME_HOURS = 24;

export type IssueClaim = Readonly<{
  /** Started (`in-progress`) or meant to be started next (`planned`). */
  state: 'planned' | 'started';
  /** Who claimed it: a session URL, or any other word unique to the claimant. */
  by: string;
  /** When, as a UTC instant to the second (`2026-10-12T01:00:00Z`). */
  at: string;
}>;

export type IssueClaimComment = Readonly<
  { kind: 'released' } | { kind: 'standing'; claim: IssueClaim }
>;

/** The record line, then `prose`. */
export const writeIssueClaimComment = (
  claim: IssueClaim,
  prose: string,
): string =>
  [
    `${MARKER} state=${claim.state} by=${claim.by} at=${claim.at} -->`,
    '',
    prose.trim(),
  ].join('\n');

/** The record line saying the claim was given up, and `prose`. */
export const writeReleasedIssueClaimComment = (prose: string): string =>
  [`${MARKER} released -->`, '', prose.trim()].join('\n');

/** What the comment says, or `undefined` for a comment this module did not write. */
export const parseIssueClaimComment = (
  body: string,
): IssueClaimComment | undefined => {
  const first = body.trim().split(/\r?\n/u, 1)[0]?.trim();

  if (first === undefined) {
    return undefined;
  }

  if (first === `${MARKER} released -->`) {
    return { kind: 'released' };
  }

  const groups = STANDING_LINE.exec(first)?.groups;

  const state = groups?.['state'];

  const by = groups?.['by'];

  const at = groups?.['at'];

  return by === undefined ||
    at === undefined ||
    (state !== 'planned' && state !== 'started')
    ? undefined
    : { kind: 'standing', claim: { state, by, at } };
};

/** Whether `claim` still holds the issue at `nowEpochMs`. */
export const issueClaimApplies = (
  claim: IssueClaim,
  nowEpochMs: number,
): boolean => {
  const at = epochMsOf(claim.at);

  return (
    at !== undefined &&
    at - CLOCK_SKEW_MINUTES * MS_PER_MINUTE <= nowEpochMs &&
    (claim.state === 'started' ||
      nowEpochMs < at + PLANNED_CLAIM_LIFETIME_HOURS * MS_PER_HOUR)
  );
};

/**
 * Reads `comments`, oldest first, for the oldest claim comment, and whether it
 * still holds; `undefined` when there is none.
 */
export const readIssueClaim = (
  comments: readonly OwnComment[],
  nowEpochMs: number,
): QueueComment<IssueClaimComment> | undefined => {
  for (const { id, body } of comments) {
    const says = parseIssueClaimComment(body);

    if (says !== undefined) {
      return {
        commentId: id,
        says,
        applies:
          says.kind === 'standing' && issueClaimApplies(says.claim, nowEpochMs),
      };
    }
  }

  return undefined;
};

const MS_PER_MINUTE = 60_000;

const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/** The first line starts with this, so the comment is found by it. */
const MARKER = '<!-- start-issue:claim';

const STANDING_LINE =
  /^<!-- start-issue:claim state=(?<state>planned|started) by=(?<by>[^\s>]+) at=(?<at>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) -->$/u;
