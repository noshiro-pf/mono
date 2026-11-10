/**
 * The hidden records the queue writes as the first line of a comment
 * (`spec/conventions.md`, "Comment records"): a set-aside, a claim on a pull
 * request, a claim on an issue. Each kind is one comment per pull request or
 * issue, edited in place; of several, the oldest is the one.
 *
 * The caller hands in only comments its own account wrote: the repository is
 * public, so anyone can post the same first line.
 */

/** The oldest of `comments` (oldest first) that `parse` reads. */
export const findRecord = <A,>(
  comments: readonly OwnCommentBody[],
  parse: (body: string) => A | undefined,
): FoundRecord<A> | undefined => {
  for (const { id, body } of comments) {
    const says = parse(body);

    if (says !== undefined) {
      return { commentId: id, says };
    }
  }

  return undefined;
};

/** Whether `by` can be written into a record line and read back. */
export const isClaimant = (by: string): boolean => CLAIMANT.test(by);

export const firstLineOf = (body: string): string =>
  body.trim().split(/\r?\n/u, 1)[0]?.trim() ?? '';

/** A comment by the reader's own account, oldest first in any list. */
export type OwnCommentBody = Readonly<{ id: number; body: string }>;

/** The oldest comment `parse` reads as a record, with what it says. */
export type FoundRecord<A> = Readonly<{
  /** The REST id, which editing it in place takes. */
  commentId: number;
  says: A;
}>;

/**
 * How many of a pull request's or issue's most recent comments are searched for
 * a record; one older than that is not found, and a new one is posted.
 */
export const RECORD_COMMENT_SCAN = 100;

/**
 * How far ahead of the reader's clock a claim may be dated and still count;
 * further is a clock that would stretch the lifetime by as much.
 */
export const CLAIM_CLOCK_SKEW_MS = 5 * 60_000;

export type ClaimComment<C> = Readonly<
  { kind: 'released' } | { kind: 'standing'; claim: C }
>;

/** No white space, which ends the field, and no `>`, which could end the comment. */
const CLAIMANT = /^[^\s>]+$/u;
