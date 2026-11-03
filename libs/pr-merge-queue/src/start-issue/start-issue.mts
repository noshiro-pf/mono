import {
  closingKeywordIssuesIn,
  hasLabel,
  IN_PROGRESS_LABEL,
  isClaimant,
  PLANNED_CLAIM_LIFETIME_HOURS,
  PLANNED_LABEL,
  readIssueClaim,
  writeIssueClaimComment,
  writeReleasedIssueClaimComment,
  type IssueClaim,
  type IssueClaimComment,
  type QueueComment,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { StrictPick } from 'ts-type-forge';
import {
  addLabel,
  currentEpochMs,
  isoSeconds,
  pullRequestNumber,
  removeLabel,
  resolveApiContext,
  rest,
  restAllPages,
  viewerLogin,
  type ApiContext,
} from '../lib/index.mjs';

/** What `start-issue --help` prints. */
export const START_ISSUE_HELP = [
  'Usage: start-issue <number> --by <claimant> [--plan | --release] [--force]',
  '',
  'Marks an issue as started before work on it begins: labels it in-progress,',
  'takes planned off, and says in a comment who started it. Refuses one',
  'someone else claimed or labelled in-progress, or one an open pull request',
  'closes, since someone else may be on it.',
  '',
  'Options:',
  '  --by <claimant>  who starts it: a session URL, or any word unique to you',
  `  --plan           label it planned instead: you mean to start it next (lapses after ${PLANNED_CLAIM_LIFETIME_HOURS} hours)`,
  '  --release        take in-progress and planned off again, when the work is dropped',
  '  --force          go on past a refusal, once whoever decides has said to',
  '  -h, --help       show this help',
].join('\n');

/**
 * Marks an issue as started (`pr-report-core`'s `IN_PROGRESS_LABEL`) before
 * work on it begins, or as meant to be started next (`PLANNED_LABEL`), and says
 * who in a claim comment (`pr-report-core`'s `issue-claim.mts`), so that two
 * sessions do not pick up the same one, and so that the one refused can say
 * whose it is.
 *
 * ```sh
 * start-issue 2701 --by <session URL>            # label it in-progress, take planned off
 * start-issue 2701 --by <session URL> --plan     # label it planned: started next
 * start-issue 2701 --by <session URL> --force    # the same, past a refusal someone overruled
 * start-issue 2701 --by <session URL> --release  # take the labels off: the work is dropped
 * ```
 *
 * It refuses — exits 1 and says why — an issue someone else holds a claim on,
 * one labelled `in-progress` with no claim naming its claimant, or one an open
 * pull request closes by a closing keyword, since someone may be on it. That is
 * a question for a person, not for the session that ran it: `--force` is the
 * answer they give. The claimant itself may run it again: a start is renewed,
 * and a plan becomes a start.
 *
 * Only closing keywords count as an open pull request closing the issue: a pull
 * request linked in the Development sidebar alone is GraphQL's to tell, and the
 * page shows it as in progress all the same.
 *
 * The claim is written, then read back after a pause: of two sessions claiming
 * the same issue at once, the one the oldest claim comment names is the one that
 * holds it, and only that one goes on to label it. It writes as the token's
 * account, and reads only that account's comments.
 */
export const startIssue = async (
  args: StartIssueArgs,
): Promise<Result<string, string>> => {
  const context = await resolveApiContext();

  if (Result.isErr(context)) {
    return context;
  }

  const viewer = await viewerLogin(context.value.token);

  if (Result.isErr(viewer)) {
    return Result.err(`cannot read who the token is: ${viewer.value}`);
  }

  const before = await readIssue(
    context.value,
    args.number,
    viewer.value,
    // Read only where it can refuse: `--force` starts it whatever closes it.
    args.mode !== 'release' && !args.force,
  );

  if (Result.isErr(before)) {
    return before;
  }

  return args.mode === 'release'
    ? release(context.value, args, before.value)
    : claimIssue(
        context.value,
        { ...args, mode: args.mode },
        viewer.value,
        before.value,
      );
};

/**
 * Whether to start or plan an issue, and whether to take `planned` off as it is
 * started: one someone else claimed, or one already started by the label or by
 * an open pull request, is refused unless `force`d; one that is closed, or is a
 * pull request, or a plan for one that is started, is refused whatever.
 */
export const decideStart = (
  issue: IssueFacts,
  args: StrictPick<StartIssueArgs, 'by' | 'force'> &
    Readonly<{ mode: 'plan' | 'start' }>,
): Readonly<Refusal | { kind: 'claim'; removePlanned: boolean }> => {
  const nothingToStart = refuseNothingToStart(issue);

  if (nothingToStart !== undefined) {
    return nothingToStart;
  }

  if (args.mode === 'plan' && hasLabel(issue.labels, IN_PROGRESS_LABEL)) {
    return {
      kind: 'refuse',
      reason: `it is labelled ${IN_PROGRESS_LABEL}: started, not planned (--release takes that off first)`,
      overridable: false,
    };
  }

  const mine = issue.claim?.by === args.by;

  if (!mine && !args.force && issue.claim !== undefined) {
    return {
      kind: 'refuse',
      reason: claimedBy(issue.claim),
      overridable: true,
    };
  }

  if (!args.force && Arr.isNonEmpty(issue.closers)) {
    return {
      kind: 'refuse',
      reason: `open pull request ${issue.closers.map((number) => `#${number}`).join(', ')} closes it`,
      overridable: true,
    };
  }

  // A label no claim of the claimant's accounts for: put on by hand, or by
  // someone else's claim that has since lapsed.
  const label = args.mode === 'start' ? IN_PROGRESS_LABEL : PLANNED_LABEL;

  if (
    issue.lastClaimant !== args.by &&
    !args.force &&
    hasLabel(issue.labels, label)
  ) {
    return {
      kind: 'refuse',
      reason: `it is already labelled ${label}`,
      overridable: true,
    };
  }

  return {
    kind: 'claim',
    removePlanned:
      args.mode === 'start' && hasLabel(issue.labels, PLANNED_LABEL),
  };
};

/**
 * Whether to release an issue: one someone else holds a claim on is refused
 * unless `force`d, and a pull request whatever.
 */
export const decideRelease = (
  issue: IssueFacts,
  args: StrictPick<StartIssueArgs, 'by' | 'force'>,
): Readonly<Refusal | { kind: 'release' }> =>
  issue.pullRequest
    ? refusePullRequest
    : !args.force && issue.claim !== undefined && issue.claim.by !== args.by
      ? ({
          kind: 'refuse',
          reason: claimedBy(issue.claim),
          overridable: true,
        } as const)
      : ({ kind: 'release' } as const);

/** The command line, or what is wrong with it. */
export const parseStartIssueArgs = (
  args: readonly string[],
): StartIssueArgs | string => {
  const byAt = args.indexOf('--by');

  const by = byAt === -1 ? undefined : args[byAt + 1];

  const others = args.filter(
    (arg, index) =>
      arg !== '--' && (byAt === -1 || (index !== byAt && index !== byAt + 1)),
  );

  const flags = others.filter((arg) => arg.startsWith('--'));

  const positional = others.filter((arg) => !arg.startsWith('--'));

  const unknown = flags.filter(
    (flag) => flag !== '--force' && flag !== '--plan' && flag !== '--release',
  );

  const [first] = positional;

  const number = first === undefined ? undefined : pullRequestNumber(first);

  return Arr.isNonEmpty(unknown)
    ? `unknown option: ${unknown.join(' ')}`
    : flags.includes('--plan') && flags.includes('--release')
      ? '--plan and --release do not go together'
      : positional.length > 1
        ? `unexpected argument: ${Arr.tail(positional).join(' ')}`
        : number === undefined
          ? 'name the issue by its number'
          : by === undefined || !isClaimant(by)
            ? '--by names who starts it: a session URL, or any other word unique to you'
            : {
                number,
                by,
                mode: flags.includes('--release')
                  ? 'release'
                  : flags.includes('--plan')
                    ? 'plan'
                    : 'start',
                force: flags.includes('--force'),
              };
};

/** What {@link decideStart} and {@link decideRelease} read of an issue. */
export type IssueFacts = Readonly<{
  open: boolean;
  /** The issues route answers for a pull request too. */
  pullRequest: boolean;
  labels: readonly Readonly<{ name: string }>[];
  /** The open pull requests that close it, lowest first. */
  closers: readonly number[];
  /** The claim that holds it now, if one does. */
  claim: IssueClaim | undefined;
  /**
   * Who the claim comment names, holding or not: a plan lapsed is still its
   * claimant's to write again, and the label it put on still its own.
   */
  lastClaimant: string | undefined;
}>;

export type StartIssueArgs = Readonly<{
  number: number;
  /** Who claims it: a session URL, or any other word unique to the claimant. */
  by: string;
  mode: 'plan' | 'release' | 'start';
  force: boolean;
}>;

/**
 * The open pull requests whose bodies close `issue` by a closing keyword, read
 * from GitHub's rendering as `open-pr` reads them. The first hundred only, as
 * there: a repository with more open than that has other problems.
 */
export const openPullsClosing = async (
  context: ApiContext,
  issue: number,
): Promise<Result<readonly number[], string>> =>
  Result.map(
    await rest(context, 'GET', '/pulls', PullBodiesSchema, {
      query: { state: 'open', per_page: '100' },
      withBodyHtml: true,
    }),
    (pulls) =>
      pulls
        .filter(({ body_html: html }) =>
          closingKeywordIssuesIn(context.repo, html ?? '').includes(issue),
        )
        .map(({ number }) => number)
        .toSorted((a, b) => a - b),
  );

type Refusal = Readonly<{
  kind: 'refuse';
  reason: string;
  overridable: boolean;
}>;

type IssueState = Readonly<{
  facts: IssueFacts;
  /** The claim comment, holding or not, which a new claim is written over. */
  comment: QueueComment<IssueClaimComment> | undefined;
}>;

const refusePullRequest: Refusal = {
  kind: 'refuse',
  reason: 'it is a pull request, not an issue',
  overridable: false,
} as const;

const refuseNothingToStart = (issue: IssueFacts): Refusal | undefined =>
  issue.pullRequest
    ? refusePullRequest
    : issue.open
      ? undefined
      : ({
          kind: 'refuse',
          reason: 'it is closed',
          overridable: false,
        } as const);

const claimedBy = (claim: IssueClaim): string =>
  `${claim.by} ${claim.state} it at ${claim.at}` as const;

/**
 * The claim comment `viewer` wrote on the issue, read from every page: a claim
 * posted on an issue that already has a hundred comments is on the second.
 */
const readClaim = async (
  context: ApiContext,
  number: number,
  viewer: string,
): Promise<Result<QueueComment<IssueClaimComment> | undefined, string>> =>
  Result.map(
    await restAllPages(
      context,
      `/issues/${number}/comments`,
      CommentListSchema,
    ),
    (comments) =>
      readIssueClaim(
        comments
          .filter(({ user }) => user?.login === viewer)
          .map(({ id, body }) => ({ id, body: body ?? '' })),
        currentEpochMs(),
      ),
  );

const holdingClaim = (
  comment: QueueComment<IssueClaimComment> | undefined,
): IssueClaim | undefined =>
  comment?.applies === true && comment.says.kind === 'standing'
    ? comment.says.claim
    : undefined;

/**
 * The issue, the open pull requests closing it when `withClosers`, and the
 * claim comment `viewer` wrote on it.
 */
const readIssue = async (
  context: ApiContext,
  number: number,
  viewer: string,
  withClosers: boolean,
): Promise<Result<IssueState, string>> => {
  const [issue, closers, comment] = await Promise.all([
    rest(context, 'GET', `/issues/${number}`, IssueSchema),
    withClosers
      ? openPullsClosing(context, number)
      : Promise.resolve(Result.ok<readonly number[]>([])),
    readClaim(context, number, viewer),
  ]);

  if (Result.isErr(issue)) {
    return issue;
  }

  if (Result.isErr(closers)) {
    return closers;
  }

  if (Result.isErr(comment)) {
    return comment;
  }

  const says = comment.value?.says;

  return Result.ok({
    facts: {
      open: issue.value.state === 'open',
      pullRequest: issue.value.pull_request !== undefined,
      labels: issue.value.labels,
      closers: closers.value,
      claim: holdingClaim(comment.value),
      lastClaimant: says?.kind === 'standing' ? says.claim.by : undefined,
    },
    comment: comment.value,
  });
};

/** Writes `body` over `commentId`, or as a new comment; the id written. */
const writeComment = async (
  context: ApiContext,
  number: number,
  commentId: number | undefined,
  body: string,
): Promise<Result<number, string>> => {
  const written =
    commentId === undefined
      ? await rest(
          context,
          'POST',
          `/issues/${number}/comments`,
          CommentSchema,
          { body: { body } },
        )
      : await rest(
          context,
          'PATCH',
          `/issues/comments/${commentId}`,
          CommentSchema,
          { body: { body } },
        );

  return Result.isErr(written)
    ? Result.err(`cannot write the claim on #${number}: ${written.value}`)
    : Result.ok(written.value.id);
};

const claimIssue = async (
  context: ApiContext,
  args: StartIssueArgs & Readonly<{ mode: 'plan' | 'start' }>,
  viewer: string,
  before: IssueState,
): Promise<Result<string, string>> => {
  const verb = args.mode === 'start' ? 'started' : 'planned';

  const decided = decideStart(before.facts, args);

  if (decided.kind === 'refuse') {
    return Result.err(
      decided.overridable
        ? `#${args.number} not ${verb}: ${decided.reason}. Someone may be working on it: ask whoever decides before going on, and rerun with --force only once they say to (or, if the work was dropped, --release --force takes it off).`
        : `#${args.number} not ${verb}: ${decided.reason}.`,
    );
  }

  const atEpochMs = currentEpochMs();

  const until = isoSeconds(
    atEpochMs + PLANNED_CLAIM_LIFETIME_HOURS * MS_PER_HOUR,
  );

  const written = await writeComment(
    context,
    args.number,
    before.comment?.commentId,
    writeIssueClaimComment(
      { state: verb, by: args.by, at: isoSeconds(atEpochMs) },
      args.mode === 'start'
        ? `Started by ${args.by}. \`start-issue\` refuses it to anyone else until it is released or a pull request closes it.`
        : `Planned by ${args.by}, to be started next. \`start-issue\` refuses it to anyone else until ${until}, unless ${args.by} starts it or plans it again.`,
    ),
  );

  if (Result.isErr(written)) {
    return written;
  }

  // Two claimants writing at once both see nothing to refuse. Whichever claim
  // reads back afterwards is the one that holds — the oldest comment, last
  // written — and the other learns it lost here, before it labels anything.
  await new Promise((resolve) => {
    setTimeout(resolve, READ_BACK_DELAY_MS);
  });

  const after = await readClaim(context, args.number, viewer);

  if (Result.isErr(after)) {
    return after;
  }

  const held = holdingClaim(after.value);

  if (held?.by !== args.by) {
    // A comment of its own that lost to an older one says nothing true.
    if (written.value !== after.value?.commentId) {
      await rest(
        context,
        'DELETE',
        `/issues/comments/${written.value}`,
        t.unknown(),
      );
    }

    // Not worded as a refusal (`not started:`), which `run-issue-resolver`
    // holds the issue for: nobody else is known to have it.
    return Result.err(
      held === undefined
        ? `#${args.number}: the claim did not read back; nothing was labelled, and a rerun tries again.`
        : `#${args.number} not ${verb}: ${held.by} claimed it at the same time.`,
    );
  }

  // `planned` first: should the second write fail, a rerun by the same claimant
  // finds its own claim and goes on.
  if (decided.removePlanned) {
    const removed = await removeLabel(context, args.number, PLANNED_LABEL);

    if (Result.isErr(removed)) {
      return removed;
    }
  }

  const label = args.mode === 'start' ? IN_PROGRESS_LABEL : PLANNED_LABEL;

  const added = await addLabel(context, args.number, label);

  if (Result.isErr(added)) {
    return added;
  }

  return Result.ok(
    `#${args.number} labelled ${label}${decided.removePlanned ? `, ${PLANNED_LABEL} taken off` : ''}, ${verb} by ${args.by}${args.mode === 'plan' ? ` until ${until}` : ''}.`,
  );
};

const release = async (
  context: ApiContext,
  args: StartIssueArgs,
  before: IssueState,
): Promise<Result<string, string>> => {
  const decided = decideRelease(before.facts, args);

  if (decided.kind === 'refuse') {
    return Result.err(
      decided.overridable
        ? `#${args.number} not released: ${decided.reason}. Ask whoever decides before going on, and rerun with --force only once they say to.`
        : `#${args.number}: ${decided.reason}.`,
    );
  }

  const mut_done: string[] = [];

  if (before.comment?.says.kind === 'standing') {
    const previous = before.comment.says.claim.by;

    const written = await writeComment(
      context,
      args.number,
      before.comment.commentId,
      writeReleasedIssueClaimComment(
        `${args.by} released the claim${previous === args.by ? '' : ` ${previous} held`}; anyone may start it.`,
      ),
    );

    if (Result.isErr(written)) {
      return written;
    }

    mut_done.push('claim released');
  }

  const labels = [IN_PROGRESS_LABEL, PLANNED_LABEL].filter((label) =>
    hasLabel(before.facts.labels, label),
  );

  const removed = await Promise.all(
    labels.map(async (label) => removeLabel(context, args.number, label)),
  );

  const failed = removed.find(Result.isErr);

  if (failed !== undefined) {
    return failed;
  }

  mut_done.push(...labels.map((label) => `${label} taken off`));

  return Result.ok(
    Arr.isNonEmpty(mut_done)
      ? `#${args.number}: ${mut_done.join(', ')}.`
      : `#${args.number}: nothing to release.`,
  );
};

/** Long enough for a write made in the same moment to be read back too. */
const READ_BACK_DELAY_MS = 3000;

const MS_PER_HOUR = 3_600_000;

const IssueSchema = t.record({
  state: t.string(),
  pull_request: t.optional(t.record({})),
  labels: t.array(t.record({ name: t.string() })),
});

const PullBodiesSchema = t.array(
  t.record({
    number: t.number(),
    body_html: t.optional(t.union([t.string(), t.nullType])),
  }),
);

const CommentSchema = t.record({
  id: t.number(),
  body: t.union([t.string(), t.nullType]),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
});

const CommentListSchema = t.array(CommentSchema);
