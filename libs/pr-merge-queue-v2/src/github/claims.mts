/**
 * How a command claims an issue or a pull request: write the claim comment,
 * pause, and read the record back (`spec/conventions.md`, "Comment records").
 * Of two claimants writing at once, both see nothing to refuse; the oldest
 * comment is the record, and the other learns it lost here.
 *
 * Nothing is deleted, as in v1. Which comment may go cannot be told from a read
 * that can lag: the one written may be the record others already gave way to,
 * or one a label rests on. A newer comment beside the record is never read as
 * one while the record is among the comments searched.
 */

import type { ClaimComment, Read, ReadContext } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import { messageOf } from './messages.mjs';
import type { SessionWorld } from './session.mjs';
import { writeComment } from './writes.mjs';

/**
 * Writes `body` over comment `commentId`, or as a new comment on `number`,
 * pauses for {@link READ_BACK_DELAY_MS}, then reads back with `readBack`.
 *
 * The read is `settled` when it names as the record (`recordIdOf`) the comment
 * written or an older one (ids only grow): what that record says is the
 * verdict. Otherwise (no record, or a newer one: the read lags, or the comment
 * is gone) which comment is the record is unknown, and the one written may be
 * it. A read-back that failed is an error saying so.
 */
export const writeClaimAndReadBack = async <A,>(
  write: Readonly<{
    context: ReadContext;
    number: number;
    commentId: number | undefined;
    body: string;
  }>,
  readBack: () => Promise<Read<A>>,
  recordIdOf: (read: A) => number | undefined,
  world: StrictPick<ClaimWorld, 'sleep'>,
): Promise<Result<ClaimReadBack<A>, string>> => {
  const { context, number, commentId, body } = write;

  const written = await writeComment(context, number, commentId, body);

  if (Result.isErr(written)) {
    return written;
  }

  await world.sleep(READ_BACK_DELAY_MS);

  const after = await readBack();

  const id = written.value;

  if (Result.isErr(after)) {
    return Result.err(unsettledMessage(number, messageOf(after.value), id));
  }

  const record = recordIdOf(after.value);

  return Result.ok(
    record === undefined || record > id
      ? { settled: false, after: after.value, commentId: id }
      : { settled: true, after: after.value },
  );
};

/** {@link unsettledMessage} for comments read that did not show the claim. */
export const laggedMessage = (number: number, commentId: number): string =>
  unsettledMessage(number, 'the comments read did not show it', commentId);

/**
 * Why a settled record holds no claim of the claimant's, though no one else's
 * holds either: released meanwhile, or lapsed. A rerun claims it again.
 */
export const heldByNoneReason = (
  says: ClaimComment<unknown> | undefined,
): string =>
  says?.kind === 'released'
    ? 'the claim was released meanwhile'
    : 'the claim read back holds no more';

/**
 * What {@link writeClaimAndReadBack} read: `settled`, a record that is the
 * verdict; or not, with the comment written, which may hold the claim.
 */
export type ClaimReadBack<A> = Readonly<
  { settled: true; after: A } | { settled: false; after: A; commentId: number }
>;

/** What a claiming command reads and writes the world through. */
export type ClaimWorld = SessionWorld &
  Readonly<{
    /** The clock, asked again after the pause. */
    nowEpochMs: () => number;
    /** The pause before the claim is read back. */
    sleep: (ms: number) => Promise<void>;
  }>;

/** Long enough for a write made in the same moment to be read back too. */
export const READ_BACK_DELAY_MS = 3000;

/**
 * The message for a read-back that settled nothing, `why` in parentheses: the
 * comment written may hold the claim, and both a rerun and a release act on the
 * record, whichever it is.
 */
const unsettledMessage = (
  number: number,
  why: string,
  commentId: number,
): string =>
  `#${number}: the claim did not read back (${why}); nothing more was done. Comment ${commentId}, if it is still there, may hold the claim: a rerun with the same claimant settles it once the comment shows, and so does --release.` as const;
