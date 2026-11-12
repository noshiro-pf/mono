/**
 * `claim-pr`: claims a pull request `unblock-prs` set aside, before fixing it,
 * so that the worker and every other session leave it alone meanwhile, or gives
 * the claim up (`spec/commands.md`, `claim-pr`).
 *
 * A claim is refused for a pull request whose owner, read from the whole queue
 * as `pr-report` reads it, is not a skill (the worker is about to act on it, or
 * a person has to), and for one someone else's claim holds. A push to the
 * branch ends the claim by itself; `--release` gives it up without one.
 *
 * The claim is written, then read back after a pause: of two sessions claiming
 * at once, the one the oldest claim comment names holds it. It writes as the
 * token's account, which has to be the one `unblock-prs` runs as: both trust
 * only that account's comments.
 */

import {
  decidePullRequestClaim,
  decideReleasePullRequestClaim,
  epochMsOf,
  instantOf,
  PULL_REQUEST_CLAIM_LIFETIME_MS,
  pullRequestClaimLapsesAt,
  pullRequestMovedReason,
  readOwnPullRequestClaim,
  readPullRequestClaim,
  readPullRequestState,
  recheckPullRequestClaim,
  writePullRequestClaimComment,
  writeReleasedPullRequestClaimComment,
  type ReadContext,
} from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import {
  heldByNoneReason,
  laggedMessage,
  messageOf,
  openSession,
  writeClaimAndReadBack,
  writeComment,
  type ClaimWorld,
  type Session,
} from '../../github/index.mjs';
import { readQueue } from '../pr-report/index.mjs';
import type { ClaimPrOptions } from './options.mjs';

/** What was done, or why nothing was. */
export const claimPr = async (
  options: ClaimPrOptions,
  world: ClaimWorld,
): Promise<Result<string, string>> => {
  const session = await openSession(options.repo, world);

  return Result.isErr(session)
    ? session
    : options.release
      ? release(session.value, options)
      : claim(session.value, options, world);
};

const notOpen = (number: number): string =>
  `#${number} is not an open pull request.` as const;

const notAPullRequest = (number: number): string =>
  `#${number} is not a pull request.` as const;

/**
 * Refuses a number that is not an open pull request, in one request, before the
 * claim reads the whole queue.
 */
const refuseUnlessOpen = async (
  context: ReadContext,
  number: number,
): Promise<Result<undefined, string>> => {
  const state = await readPullRequestState(context, number);

  return Result.isErr(state)
    ? Result.err(messageOf(state.value))
    : state.value === 'open'
      ? Result.ok(undefined)
      : Result.err(
          state.value === 'none' ? notAPullRequest(number) : notOpen(number),
        );
};

const claim = async (
  { context, viewer }: Session,
  { number, by }: ClaimPrOptions,
  world: ClaimWorld,
): Promise<Result<string, string>> => {
  const open = await refuseUnlessOpen(context, number);

  if (Result.isErr(open)) {
    return open;
  }

  const queue = await readQueue(context, world.nowEpochMs());

  if (Result.isErr(queue)) {
    return queue;
  }

  const pr = queue.value.pullRequests.find(
    ({ facts }) => facts.number === number,
  );

  if (pr === undefined) {
    return Result.err(notOpen(number));
  }

  const { headSha } = pr.facts;

  const decided = decidePullRequestClaim(pr, { by, headSha });

  if (decided.kind === 'refuse') {
    return Result.err(`#${number} not claimed: ${decided.reason}.`);
  }

  // The queue took many seconds to read: a claim written meanwhile, or a push,
  // is seen here rather than written over.
  const fresh = await readPullRequestClaim(context, number, viewer);

  if (Result.isErr(fresh)) {
    return Result.err(messageOf(fresh.value));
  }

  const atEpochMs = world.nowEpochMs();

  const rechecked = recheckPullRequestClaim(fresh.value, {
    by,
    headSha,
    nowEpochMs: atEpochMs,
  });

  if (rechecked.kind === 'refuse') {
    return Result.err(`#${number} not claimed: ${rechecked.reason}.`);
  }

  // The comment's own lapse time. Should an older comment of the claimant's be
  // the record, readers go by that one's time, which the message below names.
  const until = instantOf(atEpochMs + PULL_REQUEST_CLAIM_LIFETIME_MS);

  const readBack = await writeClaimAndReadBack(
    {
      context,
      number,
      commentId: rechecked.commentId,
      body: writePullRequestClaimComment(
        { headSha, by, at: instantOf(atEpochMs) },
        `Being fixed by ${by}${decided.setAsideFor === undefined ? '' : `, after \`unblock-prs\` set it aside (\`${decided.setAsideFor}\`)`}. \`unblock-prs\` and other sessions leave it alone until the branch is pushed, or until ${until}.`,
      ),
    },
    async () => readPullRequestClaim(context, number, viewer),
    ({ comment }) => comment?.commentId,
    world,
  );

  if (Result.isErr(readBack)) {
    return readBack;
  }

  if (!readBack.value.settled) {
    // The pull request's own facts stand whatever the comments show: closed, or
    // pushed to, no claim at the head it read can hold, the comment written
    // included, so nothing is said of it. Only the head coming back, by a push
    // or a reopening within the claim's lifetime, would make it hold again.
    const moved = pullRequestMovedReason(readBack.value.after, headSha);

    return Result.err(
      moved === undefined
        ? laggedMessage(number, readBack.value.commentId)
        : `#${number} not claimed: ${moved}.`,
    );
  }

  const { after } = readBack.value;

  // What it reads back is checked as what it read before writing was.
  const verdict = recheckPullRequestClaim(after, {
    by,
    headSha,
    nowEpochMs: world.nowEpochMs(),
  });

  if (verdict.kind === 'refuse') {
    return Result.err(`#${number} not claimed: ${verdict.reason}.`);
  }

  if (verdict.held === undefined) {
    // Not worded as a refusal (`not claimed:`): nobody else is known to have
    // it.
    return Result.err(
      `#${number}: ${heldByNoneReason(after.comment?.says)}; nothing more was done, and a rerun claims it again.`,
    );
  }

  // The record's own time: an older comment of the claimant's may be it. A claim
  // that holds has an `at` that parses, so the guard is for the type alone; the
  // helpers take a parsed time so that no unparsed `at` reads as "never".
  const heldAt = epochMsOf(verdict.held.at);

  return Result.ok(
    `#${number} claimed by ${by} at ${headSha}, until it is pushed${heldAt === undefined ? '' : ` or ${instantOf(pullRequestClaimLapsesAt(heldAt))}`}.`,
  );
};

const release = async (
  { context, viewer }: Session,
  { number, by }: ClaimPrOptions,
): Promise<Result<string, string>> => {
  // Whatever state the pull request is in, so long as `number` names one: one
  // closed may be reopened, and a claim not given up would hold again. The
  // state first, so that an issue's comments are not paged through for nothing;
  // a failed read is a rerun, as everywhere.
  const state = await readPullRequestState(context, number);

  if (Result.isErr(state)) {
    return Result.err(messageOf(state.value));
  }

  if (state.value === 'none') {
    return Result.err(notAPullRequest(number));
  }

  const before = await readOwnPullRequestClaim(context, number, viewer);

  if (Result.isErr(before)) {
    return Result.err(messageOf(before.value));
  }

  const decided = decideReleasePullRequestClaim(before.value, by);

  if (decided.kind === 'none') {
    return Result.ok(`#${number}: ${by} holds no claim on it.`);
  }

  const written = await writeComment(
    context,
    number,
    decided.commentId,
    writeReleasedPullRequestClaimComment(
      `${by} gave up the claim; \`unblock-prs\` and other sessions may take it up again.`,
    ),
  );

  return Result.map(written, () => `#${number}: claim released.`);
};
