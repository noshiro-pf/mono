/**
 * `start-issue`: marks an issue started (`in-progress`) before work on it
 * begins, or meant to be started next (`planned`), and says who in a claim
 * comment, so that two sessions do not pick up the same one, and the one
 * refused can say whose it is (`spec/commands.md`, `start-issue`).
 *
 * A refusal someone may overrule is a question for a person, not for the
 * session that ran it: `--force` is the answer they give. The claimant itself
 * may run it again: a start is renewed, and a plan becomes a start.
 *
 * The claim is written, then read back after a pause: of two sessions claiming
 * the same issue at once, the one the oldest claim comment names holds it, and
 * only that one goes on to label it. It writes as the token's account, and
 * reads only that account's comments.
 */

import {
  decideReleaseIssue,
  decideStartIssue,
  epochMsOf,
  heldIssueClaim,
  instantOf,
  issueClaimLapsesAt,
  IssueLabel,
  PLANNED_ISSUE_CLAIM_LIFETIME_MS,
  readBackVerdict,
  readIssueClaim,
  readStartIssue,
  writeIssueClaimComment,
  writeReleasedIssueClaimComment,
  type StartIssueRead,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import {
  addLabel,
  heldByNoneReason,
  laggedMessage,
  messageOf,
  openSession,
  removeLabel,
  writeClaimAndReadBack,
  writeComment,
  type ClaimWorld,
  type Session,
} from '../../github/index.mjs';
import type { StartIssueOptions } from './options.mjs';

/** What was done, or why nothing was. */
export const startIssue = async (
  options: StartIssueOptions,
  world: ClaimWorld,
): Promise<Result<string, string>> => {
  const session = await openSession(options.repo, world);

  if (Result.isErr(session)) {
    return session;
  }

  const before = await readStartIssue(session.value.context, options.number, {
    viewer: session.value.viewer,
    nowEpochMs: world.nowEpochMs(),
    // Read only where it can refuse: `--force` starts it whatever closes it.
    withClosers: options.mode !== 'release' && !options.force,
  });

  if (Result.isErr(before)) {
    return Result.err(messageOf(before.value));
  }

  return options.mode === 'release'
    ? release(session.value, options, before.value)
    : claim(
        session.value,
        { ...options, mode: options.mode },
        before.value,
        world,
      );
};

/** What a label write that failed after the claim held leaves. */
const unlabelled = (by: string): string =>
  `; the claim holds, and a rerun of the same command by ${by} goes on to label it.` as const;

const claim = async (
  { context, viewer }: Session,
  options: StartIssueOptions & Readonly<{ mode: 'plan' | 'start' }>,
  before: StartIssueRead,
  world: ClaimWorld,
): Promise<Result<string, string>> => {
  const { number, by } = options;

  const verb = options.mode === 'start' ? 'started' : 'planned';

  const decided = decideStartIssue(before.facts, options);

  if (decided.kind === 'refuse') {
    return Result.err(
      decided.overridable
        ? `#${number} not ${verb}: ${decided.reason}. Someone may be working on it: ask whoever decides before going on, and rerun with --force only once they say to (or, if the work was dropped, --release --force takes it off).`
        : `#${number} not ${verb}: ${decided.reason}.`,
    );
  }

  const atEpochMs = world.nowEpochMs();

  // The comment's own lapse time. Should an older comment of the claimant's be
  // the record, readers go by that one's time, which the message below names.
  const until = instantOf(atEpochMs + PLANNED_ISSUE_CLAIM_LIFETIME_MS);

  // Read back before anything is labelled: the claimant that lost labels
  // nothing.
  const readBack = await writeClaimAndReadBack(
    {
      context,
      number,
      commentId: before.comment?.commentId,
      body: writeIssueClaimComment(
        { state: decided.state, by, at: instantOf(atEpochMs) },
        decided.state === 'started'
          ? `Started by ${by}. \`start-issue\` refuses it to anyone else until it is released or a pull request closes it.`
          : `Planned by ${by}, to be started next. \`start-issue\` refuses it to anyone else until ${until}, unless ${by} starts it or plans it again.`,
      ),
    },
    async () => readIssueClaim(context, number, viewer),
    (found) => found?.commentId,
    world,
  );

  if (Result.isErr(readBack)) {
    return readBack;
  }

  if (!readBack.value.settled) {
    return Result.err(laggedMessage(number, readBack.value.commentId));
  }

  const { after } = readBack.value;

  const held = heldIssueClaim(after?.says, world.nowEpochMs());

  const verdict = readBackVerdict(held, { by, state: decided.state });

  if (verdict.kind === 'none') {
    // Not worded as a refusal (`not started:`), which `run-issue-resolver`
    // holds the issue for: nobody else is known to have it.
    return Result.err(
      `#${number}: ${heldByNoneReason(after?.says)}; nothing was labelled, and a rerun tries again.`,
    );
  }

  if (verdict.kind === 'lost') {
    return Result.err(
      verdict.held.by === by
        ? `#${number}: another run by ${by} wrote it ${verdict.held.state} at the same time; nothing was labelled, and a rerun settles it.`
        : `#${number} not ${verb}: ${verdict.held.by} claimed it at the same time.`,
    );
  }

  // The record's own time: an older comment of the claimant's may be it. A claim
  // that holds has an `at` that parses, so the guard is for the type alone; the
  // helpers take a parsed time so that no unparsed `at` reads as "never".
  const heldAt = epochMsOf(verdict.held.at);

  const lapses =
    heldAt === undefined
      ? undefined
      : issueClaimLapsesAt(verdict.held.state, heldAt);

  // `planned` first: should the second write fail, a rerun by the same claimant
  // finds its own claim and goes on.
  if (decided.removePlanned) {
    const removed = await removeLabel(context, number, IssueLabel.planned);

    if (Result.isErr(removed)) {
      return Result.err(`${removed.value}${unlabelled(by)}`);
    }
  }

  const added = await addLabel(context, number, decided.label);

  if (Result.isErr(added)) {
    return Result.err(`${added.value}${unlabelled(by)}`);
  }

  return Result.ok(
    `#${number} labelled ${decided.label}${decided.removePlanned ? `, ${IssueLabel.planned} taken off` : ''}, ${verb} by ${by}${lapses === undefined ? '' : ` until ${instantOf(lapses)}`}.`,
  );
};

const release = async (
  { context }: Session,
  options: StartIssueOptions,
  before: StartIssueRead,
): Promise<Result<string, string>> => {
  const { number, by } = options;

  const decided = decideReleaseIssue(before.facts, options);

  if (decided.kind === 'refuse') {
    return Result.err(
      decided.overridable
        ? `#${number} not released: ${decided.reason}. Ask whoever decides before going on, and rerun with --force only once they say to.`
        : `#${number}: ${decided.reason}.`,
    );
  }

  const mut_done: string[] = [];

  if (decided.releaseClaimOf !== undefined) {
    const previous = decided.releaseClaimOf;

    const written = await writeComment(
      context,
      number,
      before.comment?.commentId,
      writeReleasedIssueClaimComment(
        `${by} released the claim${previous === by ? '' : ` ${previous} held`}; anyone may start it.`,
      ),
    );

    if (Result.isErr(written)) {
      return written;
    }

    mut_done.push('claim released');
  }

  const removed = await Promise.all(
    decided.removeLabels.map(async (label) =>
      removeLabel(context, number, label),
    ),
  );

  const failed = removed.find(Result.isErr);

  if (failed !== undefined) {
    return failed;
  }

  mut_done.push(
    ...removed.map((each, index) => {
      const label = decided.removeLabels[index] ?? '';

      return Result.isOk(each) && each.value === 'absent'
        ? `${label} was off already`
        : `${label} taken off`;
    }),
  );

  return Result.ok(
    Arr.isNonEmpty(mut_done)
      ? `#${number}: ${mut_done.join(', ')}.`
      : `#${number}: nothing to release.`,
  );
};
