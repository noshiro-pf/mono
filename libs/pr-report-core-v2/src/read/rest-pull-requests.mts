/**
 * The open pull requests and every part of each, over REST, for the commands a
 * Claude Code session runs (its proxy refuses GraphQL). What only GraphQL
 * serves — the native stack, the timeline's base changes and so the merged
 * parent — is `skipped`, and the review's open conversations are `unknown`.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  closingKeywordIssuesInHtml,
  findRecord,
  type FoundRecord,
} from '../conventions/index.mjs';
import { pushersOf } from '../decide/index.mjs';
import type {
  ChangedFile,
  ClosingIssue,
  Comparison,
  Label,
  LatestReview,
  OwnComment,
  PullRequestFacts,
  Read,
  ReviewFacts,
} from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { isNotFound, skipped } from './classify.mjs';
import { readHeadChecks } from './rest-checks.mjs';
import {
  isContextRepository,
  pathSegment,
  RenderedBodySchema,
  restAllPages,
  restGet,
} from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * Every open pull request, lowest number first, each with every part read.
 * `viewer` is the token's account, whose comments alone are read; unread, the
 * comments are.
 */
export const readPullRequests = async (
  context: ReadContext,
  options: Readonly<{ viewer: Read<string>; defaultBranch: string }>,
): Promise<Read<readonly PullRequestFacts[]>> => {
  const listed = await restAllPages(
    context,
    'the open pull requests',
    OPEN_PULLS_PATH,
    t.array(PullListSchema),
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const permissions = permissionReader(context);

  const read = await Promise.all(
    listed.value.map(async ({ number }) =>
      readPullRequest(context, number, { ...options, permissions }),
    ),
  );

  return allRead(read);
};

/**
 * Who pushed to `branch` up to `headSha`, from the repository's activity, which
 * only REST serves; `unknown` where it is unread or the chain has a gap.
 */
export const readPushers = async (
  context: ReadContext,
  branch: string,
  headSha: string,
): Promise<readonly string[] | 'unknown'> => {
  const activity = await restAllPages(
    context,
    `the pushes to ${branch}`,
    `/activity?${activityQueryOf(branch)}`,
    t.array(ActivitySchema),
  );

  return Result.isErr(activity)
    ? 'unknown'
    : pushersOf(
        activity.value.map(({ activity_type, before, after, actor }) => ({
          activityType: activity_type,
          before,
          after,
          actor: actor?.login,
        })),
        headSha,
      );
};

/** How far a head is from its base's tip, over REST (GraphQL has no such). */
export const readComparison = async (
  context: ReadContext,
  what: string,
  base: string,
  head: string,
): Promise<Read<Comparison>> =>
  Result.map(
    await restGet(
      context,
      what,
      `/compare/${pathSegment(base)}...${head}`,
      t.record({ ahead_by: t.number(), behind_by: t.number() }),
    ),
    ({ ahead_by, behind_by }) => ({ aheadBy: ahead_by, behindBy: behind_by }),
  );

/**
 * One issue a body closes, by number: its state `unknown` where it cannot be
 * read, which holds what waits on it rather than failing the pull request.
 */
export const readClosingIssue = async (
  context: ReadContext,
  number: number,
): Promise<ClosingIssue> => {
  const read = await restGet(
    context,
    `issue #${number}`,
    `/issues/${number}`,
    t.record({
      title: t.string(),
      html_url: t.string(),
      state: t.string(),
    }),
  );

  return Result.isErr(read)
    ? { number, title: '', url: '', state: 'unknown' }
    : {
        number,
        title: read.value.title,
        url: read.value.html_url,
        state: read.value.state === 'open' ? 'open' : 'closed',
      };
};

/** When a head commit was made, read by its own sha. */
export const readHeadCommittedAt = async (
  context: ReadContext,
  sha: string,
): Promise<Read<string>> =>
  Result.map(
    await restGet(
      context,
      `commit ${sha.slice(0, 7)}`,
      `/commits/${sha}`,
      t.record({
        commit: t.record({ committer: t.record({ date: t.string() }) }),
      }),
    ),
    ({ commit }) => commit.committer.date,
  );

/**
 * Every file a pull request changes, renames with their old path; `complete`
 * once past REST's 3000 or short of `changedFiles` is `false`.
 */
export const readChangedFiles = async (
  context: ReadContext,
  number: number,
  changedFiles: number | undefined,
): Promise<
  Read<Readonly<{ files: readonly ChangedFile[]; complete: boolean }>>
> =>
  Result.map(
    await restAllPages(
      context,
      `the files of #${number}`,
      `/pulls/${number}/files`,
      t.array(FileSchema),
    ),
    (files) => ({
      files: files.map(({ filename, status, previous_filename }) => ({
        path: filename,
        change: changeOf(status),
        previousPath: previous_filename,
      })),
      complete:
        files.length < FILES_LISTED &&
        (changedFiles === undefined || files.length >= changedFiles),
    }),
  );

/** Every label of a pull request or issue, over REST. */
export const readLabels = async (
  context: ReadContext,
  number: number,
): Promise<Read<readonly Label[]>> =>
  Result.map(
    await restAllPages(
      context,
      `the labels of #${number}`,
      `/issues/${number}/labels`,
      t.array(LabelSchema),
    ),
    labelsOf,
  );

/** Labels as GitHub holds them, `description` empty when none. */
export const labelsOf = (
  labels: readonly t.TypeOf<typeof LabelSchema>[],
): readonly Label[] =>
  labels.map(({ name, color, description }) => ({
    name,
    color,
    description: description ?? '',
  }));

/** This account's comments among `comments`, oldest first. */
export const ownCommentsOf = (
  comments: readonly t.TypeOf<typeof CommentSchema>[],
  viewer: string,
): readonly OwnComment[] =>
  comments
    .filter(({ user }) => user?.login === viewer)
    .map(({ id, body, created_at }) => ({
      id,
      body: body ?? '',
      createdAt: created_at,
    }));

/**
 * The oldest comment of `viewer` on `number` that `parse` reads as a record,
 * read from every page: a record posted on an issue with a hundred comments is
 * on the second.
 */
export const readOwnRecord = async <A,>(
  context: ReadContext,
  number: number,
  viewer: string,
  parse: (body: string) => A | undefined,
): Promise<Read<FoundRecord<A> | undefined>> =>
  Result.map(await readOwnComments(context, number, Result.ok(viewer)), (own) =>
    findRecord(own, parse),
  );

/** This account's comments on issue or pull request `number`. */
export const readOwnComments = async (
  context: ReadContext,
  number: number,
  viewer: Read<string>,
): Promise<Read<readonly OwnComment[]>> => {
  if (Result.isErr(viewer)) {
    return viewer;
  }

  return Result.map(
    await restAllPages(
      context,
      `the comments of #${number}`,
      `/issues/${number}/comments`,
      t.array(CommentSchema),
    ),
    (comments) => ownCommentsOf(comments, viewer.value),
  );
};

/**
 * Each login's latest submitted review in a state that counts — a pending or
 * comment-only one is passed over — of a login with `write` or above.
 */
export const latestReviewsOf = (
  reviews: readonly Readonly<{ login: string; state: string }>[],
  canWrite: (login: string) => boolean,
): readonly LatestReview[] => {
  const mut_latest = new Map<string, LatestReview>();

  for (const { login, state } of reviews) {
    const upper = state.toUpperCase();

    if (
      upper === 'APPROVED' ||
      upper === 'CHANGES_REQUESTED' ||
      upper === 'DISMISSED'
    ) {
      mut_latest.set(login, { login, state: upper });
    }
  }

  return Array.from(mut_latest.values()).filter(({ login }) => canWrite(login));
};

/**
 * The list the open pull requests are read from, oldest first; a command that
 * counts them before reading them all asks the same one.
 */
export const OPEN_PULLS_PATH = '/pulls?state=open&sort=created&direction=asc';

/** A label as REST and GraphQL send it. */
export const LabelSchema = t.record({
  name: t.string(),
  color: t.string(),
  description: t.union([t.string(), t.nullType]),
});

const PullListSchema = t.record({ number: t.number() });

const PullSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.union([t.string(), t.nullType]),
  body_html: RenderedBodySchema,
  user: t.union([t.record({ login: t.string() }), t.nullType]),
  html_url: t.string(),
  draft: t.optional(t.boolean()),
  labels: t.array(LabelSchema),
  auto_merge: t.union([t.record({}), t.nullType]),
  head: t.record({
    ref: t.string(),
    sha: t.string(),
    repo: t.union([t.record({ full_name: t.string() }), t.nullType]),
  }),
  base: t.record({ ref: t.string() }),
  mergeable_state: t.optional(t.string()),
  created_at: t.string(),
  updated_at: t.string(),
  changed_files: t.optional(t.number()),
});

type PullJson = t.TypeOf<typeof PullSchema>;

const CommentSchema = t.record({
  id: t.number(),
  body: t.union([t.string(), t.nullType]),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
  created_at: t.string(),
});

const ReviewSchema = t.record({
  state: t.string(),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
});

const FileSchema = t.record({
  filename: t.string(),
  status: t.string(),
  previous_filename: t.optional(t.string()),
});

const ActivitySchema = t.record({
  activity_type: t.string(),
  before: t.string(),
  after: t.string(),
  actor: t.union([t.record({ login: t.string() }), t.nullType]),
});

/** GitHub lists at most this many files of a pull request. */
const FILES_LISTED = 3000;

const CHANGES = [
  'added',
  'changed',
  'copied',
  'modified',
  'removed',
  'renamed',
  'unchanged',
] as const satisfies readonly ChangedFile['change'][];

/**
 * Whether each login may write, read once per login: `write`, `maintain` or
 * `admin` (REST's `permission` says `write` for `maintain`).
 */
const permissionReader = (
  context: ReadContext,
): ((login: string) => Promise<Read<boolean>>) => {
  const mut_cache = new Map<string, Promise<Read<boolean>>>();

  return async (login) => {
    const known = mut_cache.get(login);

    if (known !== undefined) {
      return known;
    }

    const read = restGet(
      context,
      `the permission of @${login}`,
      `/collaborators/${login}/permission`,
      t.record({ permission: t.string() }),
    ).then((answer): Read<boolean> =>
      Result.isErr(answer)
        ? isNotFound(answer.value)
          ? Result.ok(false)
          : answer
        : Result.ok(
            answer.value.permission === 'admin' ||
              answer.value.permission === 'write' ||
              answer.value.permission === 'maintain',
          ),
    );

    mut_cache.set(login, read);

    return read;
  };
};

const activityQueryOf = (branch: string): string => {
  const query = new URLSearchParams({
    ref: `refs/heads/${branch}`,
    activity_type: 'push',
    direction: 'asc',
  });

  return query.toString();
};

const changeOf = (status: string): ChangedFile['change'] =>
  CHANGES.find((change) => change === status) ?? 'changed';

const readReview = async (
  context: ReadContext,
  pr: PullJson,
  permissions: (login: string) => Promise<Read<boolean>>,
): Promise<Read<ReviewFacts>> => {
  const [reviews, files, pushers] = await Promise.all([
    restAllPages(
      context,
      `the reviews of #${pr.number}`,
      `/pulls/${pr.number}/reviews`,
      t.array(ReviewSchema),
    ),
    readChangedFiles(context, pr.number, pr.changed_files),
    readPushers(context, pr.head.ref, pr.head.sha),
  ]);

  if (Result.isErr(reviews)) {
    return reviews;
  }

  if (Result.isErr(files)) {
    return files;
  }

  const byLogin = Arr.generate(function* () {
    for (const { state, user } of reviews.value) {
      if (user !== null) {
        yield { login: user.login, state };
      }
    }
  });

  const logins = Arr.uniq(byLogin.map(({ login }) => login));

  const allowed = await Promise.all(logins.map(permissions));

  const unreadPermission = allowed.find(Result.isErr);

  if (unreadPermission !== undefined) {
    return unreadPermission;
  }

  const writers = new Set(
    logins.filter((_, index) => {
      const each = allowed[index];

      return each !== undefined && Result.isOk(each) && each.value;
    }),
  );

  return Result.ok({
    latestReviews: latestReviewsOf(byLogin, (login) => writers.has(login)),
    files: files.value.files,
    filesComplete: files.value.complete,
    unresolvedConversations: 'unknown',
    pushers,
  });
};

/** The issues the body closes, read from its rendering, each with its state. */
const readClosingIssues = async (
  context: ReadContext,
  bodyHtml: string | null,
): Promise<Read<readonly ClosingIssue[]>> => {
  const numbers = closingKeywordIssuesInHtml(context, bodyHtml);

  const issues = await Promise.all(
    numbers.map(async (number) => readClosingIssue(context, number)),
  );

  return Result.ok(issues);
};

const readPullRequest = async (
  context: ReadContext,
  number: number,
  options: Readonly<{
    viewer: Read<string>;
    defaultBranch: string;
    permissions: (login: string) => Promise<Read<boolean>>;
  }>,
): Promise<Read<PullRequestFacts>> => {
  const pull = await restGet(
    context,
    `#${number}`,
    `/pulls/${number}`,
    PullSchema,
    // The rendering too, where GitHub marks the closing keywords it recognized.
    'full',
  );

  if (Result.isErr(pull)) {
    return pull;
  }

  const pr = pull.value;

  const body = pr.body ?? '';

  const [headCommittedAt, checks, review, comments, closingIssues, comparison] =
    await Promise.all([
      readHeadCommittedAt(context, pr.head.sha),
      readHeadChecks(context, pr.head.sha),
      readReview(context, pr, options.permissions),
      readOwnComments(context, number, options.viewer),
      readClosingIssues(context, pr.body_html),
      readComparison(
        context,
        `the comparison of #${number}`,
        pr.base.ref,
        pr.head.sha,
      ),
    ]);

  return Result.ok({
    number,
    title: pr.title,
    body,
    author: pr.user?.login ?? '',
    url: pr.html_url,
    isDraft: pr.draft ?? false,
    labels: labelsOf(pr.labels),
    autoMerge: pr.auto_merge !== null,
    headRef: pr.head.ref,
    headSha: pr.head.sha,
    baseRef: pr.base.ref,
    fromFork: !isContextRepository(pr.head.repo?.full_name, context),
    mergeState: (pr.mergeable_state ?? 'unknown').toUpperCase(),
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    headCommittedAt,
    checks,
    review,
    comments,
    closingIssues,
    comparison,
    nativeStack: Result.err(
      skipped(`the native stack of #${number}`, ONLY_GRAPHQL),
    ),
    baseChanges: Result.err(
      skipped(`the base changes of #${number}`, ONLY_GRAPHQL),
    ),
    mergedParent: Result.err(
      skipped(`the merged parent of #${number}`, ONLY_GRAPHQL),
    ),
  });
};

const ONLY_GRAPHQL = 'only GraphQL serves it';
