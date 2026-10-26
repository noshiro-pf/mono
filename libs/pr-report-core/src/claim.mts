/**
 * Who is fixing a pull request `unblock-prs` set aside, written where every
 * writer of the queue can read it.
 *
 * `unblock-prs` leaves a set-aside pull request alone until its head moves —
 * or, for every reason but `checks-failed` and `awaiting-bypass`, until the
 * base does, when it tries the rebase again. A session fixing that pull
 * request is then racing the script, and a second session, or the one that
 * opened the pull request and is woken by the set-aside comment, may be
 * fixing the same failure. The leases on every push keep any of them from
 * overwriting another's work, but not from doing it twice. So whoever starts
 * on one says so first in a comment whose first line is a hidden record this
 * module writes and reads, and everyone else — the script included — leaves
 * that pull request to it.
 *
 * **It lasts while the head is the one it claimed**, and for at most
 * {@link CLAIM_LIFETIME_MINUTES}. The push that carries the fix moves the head
 * and so ends the claim with nothing left to clean up; that push is what
 * hands the pull request back to the script, as it always was. The lifetime is
 * for a claimant that stopped without pushing. A claimant that needs longer
 * writes the claim again.
 *
 * **One comment per pull request, edited in place**, like the set-aside one;
 * a claim that has ended is simply written over. Of several, the oldest is
 * the one, so two claimants writing at once both read back the same answer.
 *
 * **Only the comments the reader's own account wrote count**, as for the
 * set-aside comment (`set-aside.mts`): the repository is public. `by` is what
 * tells two claimants on that one account apart.
 */

import { epochMsOf } from './timestamp.mjs';

/** How long a claim lasts when the head does not move first. */
export const CLAIM_LIFETIME_MINUTES = 120;

export type Claim = Readonly<{
  /** The head it was claimed at. */
  headSha: string;
  /**
   * Who claimed it: a session URL, or any other word unique to the claimant.
   * See {@link isClaimant}.
   */
  by: string;
  /** When, as a UTC instant to the second (`2026-10-12T01:00:00Z`). */
  at: string;
}>;

export type ClaimComment = Readonly<
  { kind: 'released' } | { kind: 'standing'; claim: Claim }
>;

/** Whether `by` can be written into the record line and read back. */
export const isClaimant = (by: string): boolean => CLAIMANT.test(by);

/** The record line, then `prose`. */
export const writeClaimComment = (claim: Claim, prose: string): string =>
  [
    `${MARKER} head=${claim.headSha} by=${claim.by} at=${claim.at} -->`,
    '',
    prose.trim(),
  ].join('\n');

/** The record line saying the claim was given up, and `prose`. */
export const writeReleasedClaimComment = (prose: string): string =>
  [`${MARKER} released -->`, '', prose.trim()].join('\n');

/** What the comment says, or `undefined` for a comment this module did not write. */
export const parseClaimComment = (body: string): ClaimComment | undefined => {
  const first = body.trim().split(/\r?\n/u, 1)[0]?.trim();

  if (first === undefined) {
    return undefined;
  }

  if (first === `${MARKER} released -->`) {
    return { kind: 'released' };
  }

  const groups = STANDING_LINE.exec(first)?.groups;

  const headSha = groups?.['headSha'];

  const by = groups?.['by'];

  const at = groups?.['at'];

  return headSha === undefined || by === undefined || at === undefined
    ? undefined
    : { kind: 'standing', claim: { headSha, by, at } };
};

/**
 * Whether `claim` still holds the pull request now that its head is at
 * `headTip`, at `nowEpochMs`.
 */
export const claimApplies = (
  claim: Claim,
  headTip: string,
  nowEpochMs: number,
): boolean => {
  const at = epochMsOf(claim.at);

  return (
    claim.headSha === headTip &&
    at !== undefined &&
    at - CLOCK_SKEW_MINUTES * MS_PER_MINUTE <= nowEpochMs &&
    nowEpochMs < at + CLAIM_LIFETIME_MINUTES * MS_PER_MINUTE
  );
};

/**
 * How far ahead of the reader's clock a claim may be dated and still count.
 * Further than that is a clock that would otherwise stretch the lifetime by
 * however far ahead it ran.
 */
const CLOCK_SKEW_MINUTES = 5;

const MS_PER_MINUTE = 60_000;

/** The first line starts with this, so the comment is found by it. */
const MARKER = '<!-- unblock-prs:claim';

/** No white space, which ends the field, and no `>`, which could end the comment. */
const CLAIMANT = /^[^\s>]+$/u;

const STANDING_LINE =
  /^<!-- unblock-prs:claim head=(?<headSha>[0-9a-f]{40}) by=(?<by>[^\s>]+) at=(?<at>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z) -->$/u;
