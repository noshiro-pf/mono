import {
  CLAIM_LIFETIME_MINUTES,
  isClaimant,
  readQueueComments,
  writeClaimComment,
  writeReleasedClaimComment,
  type QueueComments,
  type QueueOwner,
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  currentEpochMs,
  isoSeconds,
  pullRequestNumber,
  resolveRepo,
  resolveToken,
  rest,
  viewerLogin,
  type ApiContext,
} from '../lib/index.mjs';
import { readQueueState } from '../pr-report/index.mjs';

/** What `claim-pr --help` prints. */
export const CLAIM_PR_HELP = [
  'Usage: claim-pr <number> --by <claimant> [--release]',
  '',
  'Claims a pull request unblock-prs set aside, before fixing it, so that',
  'unblock-prs and every other session leave it alone meanwhile. A push to',
  'the branch ends the claim; --release gives it up without one.',
  '',
  'Options:',
  '  --by <claimant>  who claims it: a session URL, or any word unique to you',
  '  --release        give the claim up',
  '  -h, --help       show this help',
  '',
  'It writes as the token (GH_TOKEN or GITHUB_TOKEN) account, which has to',
  'be the one unblock-prs runs as.',
].join('\n');

/**
 * Claims a pull request `unblock-prs` set aside, before fixing it, so that the
 * script and every other session leave it alone meanwhile
 * (`pr-report-core`'s `claim.mts` says what a claim is and how long it lasts).
 *
 * ```sh
 * claim-pr 2154 --by <session URL>            # claim, or renew
 * claim-pr 2154 --by <session URL> --release  # give it up
 * ```
 *
 * A claim is refused for a pull request whose owner (`pr-report-core`'s
 * `queue-owner.mts`, read through `pr-report/queue.mts` as every other
 * command reads it) is not a skill — the worker is about to act on it, or a
 * person has to — and for one someone else holds. A push to the branch ends the claim by itself;
 * `--release` is for giving up without one. It prints what it did, and exits
 * 1 when it did not get the claim.
 *
 * It writes as the token's account, which has to be the one `unblock-prs`
 * runs as: both trust only comments their own account wrote.
 */
export const claimPr = async (
  args: ClaimArgs,
): Promise<Result<string, string>> => {
  const token = await resolveToken();

  if (Result.isErr(token)) {
    return token;
  }

  const repo = await resolveRepo();

  if (Result.isErr(repo)) {
    return repo;
  }

  const viewer = await viewerLogin(token.value);

  if (Result.isErr(viewer)) {
    return Result.err(`cannot read who the token is: ${viewer.value}`);
  }

  const context: ApiContext = { repo: repo.value, token: token.value } as const;

  const before = await readPullRequest(context, args.number, viewer.value);

  return Result.isErr(before)
    ? before
    : args.release
      ? release(context, args, before.value)
      : claim(context, args, viewer.value, before.value);
};

/**
 * What to do about a claim by `by`, given who owns the pull request and what
 * its comments say now: write it (over `commentId` when there is one to edit
 * in place), or refuse and why.
 */
export const decideClaim = (
  owner: QueueOwner | undefined,
  queue: QueueComments,
  by: string,
): Readonly<
  | { kind: 'write'; commentId: number | undefined }
  | { kind: 'refuse'; reason: string }
> => {
  if (owner?.owner !== 'skill') {
    return {
      kind: 'refuse',
      reason:
        owner === undefined
          ? 'who owns it could not be read'
          : `it is the ${owner.owner}'s (${owner.reason}), not a skill's`,
    };
  }

  const held = queue.claim;

  if (
    held?.applies === true &&
    held.says.kind === 'standing' &&
    held.says.claim.by !== by
  ) {
    return {
      kind: 'refuse',
      reason: `${held.says.claim.by} claimed it at ${held.says.claim.at}`,
    };
  }

  return { kind: 'write', commentId: held?.commentId };
};

/** The command line, or what is wrong with it. */
export const parseClaimArgs = (args: readonly string[]): ClaimArgs | string => {
  const byAt = args.indexOf('--by');

  const by = byAt === -1 ? undefined : args[byAt + 1];

  const positional = args.filter(
    (arg, index) =>
      arg !== '--' &&
      arg !== '--release' &&
      (byAt === -1 || (index !== byAt && index !== byAt + 1)),
  );

  const [first] = positional;

  const number = first === undefined ? undefined : pullRequestNumber(first);

  return positional.length > 1
    ? `unexpected argument: ${Arr.tail(positional).join(' ')}`
    : number === undefined
      ? 'name the pull request by its number'
      : by === undefined || !isClaimant(by)
        ? '--by names the claimant: a session URL, or any other word unique to you'
        : { number, by, release: args.includes('--release') };
};

export type ClaimArgs = Readonly<{
  number: number;
  by: string;
  release: boolean;
}>;

/**
 * The head, and what this account's comments say about it against the tip
 * of the default branch, which is what a set-aside is recorded against.
 */
const readPullRequest = async (
  context: ApiContext,
  number: number,
  viewer: string,
): Promise<Result<PullRequestState, string>> => {
  const pr = await rest(context, 'GET', `/pulls/${number}`, PullRequestSchema);

  if (Result.isErr(pr)) {
    return Result.err(`cannot read #${number}: ${pr.value}`);
  }

  if (pr.value.state !== 'open') {
    return Result.err(`#${number} is ${pr.value.state}.`);
  }

  const repo = await rest(context, 'GET', '', RepositorySchema);

  if (Result.isErr(repo)) {
    return repo;
  }

  const tip = await rest(
    context,
    'GET',
    `/git/ref/heads/${repo.value.default_branch}`,
    RefSchema,
  );

  if (Result.isErr(tip)) {
    return tip;
  }

  // The first page, oldest first: both comments are edited in place, so
  // they stay where they were first posted.
  const comments = await rest(
    context,
    'GET',
    `/issues/${number}/comments`,
    CommentListSchema,
    { query: { per_page: '100' } },
  );

  if (Result.isErr(comments)) {
    return comments;
  }

  return Result.ok({
    headSha: pr.value.head.sha,
    queue: readQueueComments(
      Arr.generate(function* () {
        for (const { id, body, user } of comments.value) {
          if (user?.login === viewer) {
            yield { id, body: body ?? '' };
          }
        }
      }),
      {
        headSha: pr.value.head.sha,
        baseTip: tip.value.object.sha,
        nowEpochMs: currentEpochMs(),
      },
    ),
  });
};

const writeComment = async (
  context: ApiContext,
  number: number,
  commentId: number | undefined,
  body: string,
): Promise<Result<undefined, string>> => {
  const written =
    commentId === undefined
      ? await rest(
          context,
          'POST',
          `/issues/${number}/comments`,
          CommentSchema,
          {
            body: { body },
          },
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
    : Result.ok(undefined);
};

const claim = async (
  context: ApiContext,
  args: ClaimArgs,
  viewer: string,
  before: PullRequestState,
): Promise<Result<string, string>> => {
  const state = await readQueueState();

  if (Result.isErr(state)) {
    return Result.err(`cannot read the queue: ${state.value}`);
  }

  const decided = decideClaim(
    state.value.owners.get(args.number),
    before.queue,
    args.by,
  );

  if (decided.kind === 'refuse') {
    return Result.err(`#${args.number} not claimed: ${decided.reason}.`);
  }

  const atEpochMs = currentEpochMs();

  const reason =
    before.queue.setAside?.says.kind === 'standing'
      ? before.queue.setAside.says.setAside.reason
      : 'set aside';

  const written = await writeComment(
    context,
    args.number,
    decided.commentId,
    writeClaimComment(
      { headSha: before.headSha, by: args.by, at: isoSeconds(atEpochMs) },
      [
        `Being fixed by ${args.by}, after \`unblock-prs\` set it aside (\`${reason}\`).`,
        `\`unblock-prs\` and other sessions leave it alone until the branch is pushed, or until ${isoSeconds(atEpochMs + CLAIM_LIFETIME_MINUTES * 60_000)}.`,
      ].join(' '),
    ),
  );

  if (Result.isErr(written)) {
    return written;
  }

  // Two claimants writing at once both see nothing to refuse. Whichever
  // claim reads back afterwards is the one that holds — the oldest comment,
  // last written — and the other learns it lost here.
  await new Promise((resolve) => {
    setTimeout(resolve, READ_BACK_DELAY_MS);
  });

  const after = await readPullRequest(context, args.number, viewer);

  if (Result.isErr(after)) {
    return after;
  }

  const held = after.value.queue.claim;

  return held?.applies === true &&
    held.says.kind === 'standing' &&
    held.says.claim.by === args.by
    ? Result.ok(
        `#${args.number} claimed by ${args.by} at ${before.headSha}, until it is pushed or ${isoSeconds(atEpochMs + CLAIM_LIFETIME_MINUTES * 60_000)}.`,
      )
    : Result.err(
        `#${args.number} not claimed: ${held?.says.kind === 'standing' ? `${held.says.claim.by} claimed it at the same time` : 'the claim did not read back'}.`,
      );
};

const release = async (
  context: ApiContext,
  args: ClaimArgs,
  before: PullRequestState,
): Promise<Result<string, string>> => {
  const held = before.queue.claim;

  if (held?.says.kind !== 'standing' || held.says.claim.by !== args.by) {
    return Result.ok(`#${args.number}: ${args.by} holds no claim on it.`);
  }

  const written = await writeComment(
    context,
    args.number,
    held.commentId,
    writeReleasedClaimComment(
      `${args.by} gave up the claim; \`unblock-prs\` and other sessions may take it up again.`,
    ),
  );

  return Result.isErr(written)
    ? written
    : Result.ok(`#${args.number}: claim released.`);
};

type PullRequestState = Readonly<{ headSha: string; queue: QueueComments }>;

/** Long enough for a write made in the same moment to be read back too. */
const READ_BACK_DELAY_MS = 3000;

const PullRequestSchema = t.record({
  state: t.string(),
  head: t.record({ sha: t.string() }),
});

const RepositorySchema = t.record({ default_branch: t.string() });

const RefSchema = t.record({ object: t.record({ sha: t.string() }) });

const CommentSchema = t.record({
  id: t.number(),
  body: t.union([t.string(), t.nullType]),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
});

const CommentListSchema = t.array(CommentSchema);
