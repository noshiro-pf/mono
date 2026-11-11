/**
 * The issues, the numbers that declarations name, and the pull requests merged
 * lately, over REST.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { closingKeywordIssuesInHtml } from '../conventions/index.mjs';
import type {
  FollowedPullRequest,
  IssueFacts,
  MergedPullRequestFacts,
  OpenIssues,
  Read,
  ReferenceFacts,
} from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { isGone, isNotFound } from './classify.mjs';
import { labelsOf, readOwnComments } from './rest-pull-requests.mjs';
import {
  answersAsContext,
  RenderedBodySchema,
  restAllPages,
  restGet,
  restLeadingItems,
  restPagesUntil,
} from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The open issues, most recently updated first, up to `limit`, pull requests
 * left out, each with its "blocked by" and this account's comments.
 */
export const readOpenIssues = async (
  context: ReadContext,
  options: Readonly<{ limit: number; viewer: Read<string> }>,
): Promise<Read<OpenIssues>> => {
  const listed = await restLeadingItems(
    context,
    'the open issues',
    '/issues?state=open&sort=updated&direction=desc',
    t.array(IssueSchema),
    // The issues list holds pull requests too.
    ({ pull_request }) => pull_request === undefined,
    options.limit,
  );

  if (Result.isErr(listed)) {
    // A repository whose issues are turned off has none.
    return isGone(listed.value)
      ? Result.ok({ issues: [], complete: true })
      : listed;
  }

  const facts = await Promise.all(
    listed.value.items.map(async (issue) =>
      issueFactsOf(context, issue, options.viewer),
    ),
  );

  return Result.ok({ issues: facts, complete: listed.value.complete });
};

/**
 * What each of `numbers` is: an issue, or a reference — a pull request, merged
 * or not, or `unknown` for a number naming nothing the token may see. Read as
 * an issue, since GitHub's issues answer for pull requests too, and as a pull
 * request where that cannot say: a 410 (a deleted issue, or issues turned off),
 * or an answer without whether it merged.
 */
export const readNumbers = async (
  context: ReadContext,
  numbers: readonly number[],
  viewer: Read<string>,
): Promise<
  Read<
    Readonly<{
      issues: ReadonlyMap<number, IssueFacts>;
      references: ReadonlyMap<number, ReferenceFacts>;
    }>
  >
> => {
  const read = allRead(
    await Promise.all(
      numbers.map(async (number) => readNumber(context, number, viewer)),
    ),
  );

  return Result.map(read, (facts) => ({
    issues: new Map<number, IssueFacts>(
      facts
        .filter((each) => each.kind === 'issue')
        .map(({ facts: issue }) => [issue.number, issue] as const),
    ),
    references: new Map<number, ReferenceFacts>(
      facts
        .filter((each) => each.kind !== 'issue')
        .map((reference) => [reference.number, reference] as const),
    ),
  }));
};

/**
 * The pull requests merged most recently, up to `limit` and within `days` of
 * `nowEpochMs`, each with what its body closes.
 */
export const readMerged = async (
  context: ReadContext,
  options: Readonly<{ limit: number; days: number; nowEpochMs: number }>,
): Promise<Read<readonly MergedPullRequestFacts[]>> => {
  const since = options.nowEpochMs - options.days * 24 * 60 * 60 * 1000;

  // Newest update first, and a pull request is updated when it merges: once the
  // oldest update read is older than `limit` merges read, or than the window,
  // no later page holds a merge that would be kept.
  const listed = await restPagesUntil(
    context,
    'the merged pull requests',
    '/pulls?state=closed&sort=updated&direction=desc',
    t.array(ClosedPullSchema),
    (items) => {
      const oldest = Date.parse(items.at(-1)?.updated_at ?? '');

      return (
        oldest < since ||
        items.filter(
          ({ merged_at: mergedAt }) =>
            mergedAt !== null &&
            Date.parse(mergedAt) >= Math.max(oldest, since),
        ).length >= options.limit
      );
    },
    // The rendering, where GitHub marks the closing keywords it recognized.
    'full',
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  return Result.ok(
    Arr.generate(function* () {
      for (const pr of listed.value) {
        if (pr.merged_at !== null && Date.parse(pr.merged_at) >= since) {
          yield {
            number: pr.number,
            title: pr.title,
            author: pr.user?.login ?? '',
            url: pr.html_url,
            headRef: pr.head.ref,
            baseRef: pr.base.ref,
            mergedAt: pr.merged_at,
            headSha: pr.head.sha,
            mergeCommitSha: pr.merge_commit_sha ?? '',
            labels: labelsOf(pr.labels),
            closingIssues: closingKeywordIssuesInHtml(context, pr.body_html),
          };
        }
      }
    })
      .toSorted((a, b) => Date.parse(b.mergedAt) - Date.parse(a.mergedAt))
      .slice(0, options.limit),
  );
};

/**
 * Whether each of `numbers`, no longer open, merged or was closed. One still
 * open, or that is no pull request (404, 410), is left out.
 */
export const readFollowed = async (
  context: ReadContext,
  numbers: readonly number[],
): Promise<Read<readonly FollowedPullRequest[]>> => {
  const read = allRead(
    await Promise.all(
      numbers.map(
        async (number): Promise<Read<FollowedPullRequest | undefined>> => {
          const pull = await restGet(
            context,
            `pull request #${number}`,
            `/pulls/${number}`,
            t.record({
              merged_at: t.union([t.string(), t.nullType]),
              closed_at: t.union([t.string(), t.nullType]),
            }),
          );

          if (Result.isErr(pull)) {
            return isNotFound(pull.value) || isGone(pull.value)
              ? Result.ok(undefined)
              : pull;
          }

          const { merged_at: mergedAt, closed_at: closedAt } = pull.value;

          return Result.ok(
            mergedAt !== null
              ? { number, state: 'merged', at: mergedAt }
              : closedAt !== null
                ? { number, state: 'closed', at: closedAt }
                : undefined,
          );
        },
      ),
    ),
  );

  return Result.map(read, (followed) =>
    followed.filter((each) => each !== undefined),
  );
};

/**
 * The issues GitHub records as blocking `issue`, this repository's alone: one
 * of another repository has a number that names something else here, as v1
 * reads them. Not asked when the issue's summary says nothing blocks it.
 * **Changed in v2**: asked when the summary is absent or null, which says
 * nothing, where v1 took it for none.
 */
export const readBlockedBy = async (
  context: ReadContext,
  number: number,
  /** The issue's `issue_dependencies_summary`. */
  summary: DependenciesSummary | undefined,
): Promise<Read<readonly number[]>> =>
  summary?.total_blocked_by === 0
    ? Result.ok([])
    : Result.map(
        await restAllPages(
          context,
          `what blocks #${number}`,
          `/issues/${number}/dependencies/blocked_by`,
          t.array(t.record({ number: t.number(), repository_url: t.string() })),
        ),
        (issues) =>
          issues
            .filter(({ repository_url: url }) => answersAsContext(url, context))
            .map(({ number: blocking }) => blocking),
      );

const readAsPullRequest = async (
  context: ReadContext,
  number: number,
): Promise<Read<ReferenceFacts>> => {
  const pull = await restGet(
    context,
    `pull request #${number}`,
    `/pulls/${number}`,
    t.record({
      title: t.string(),
      state: t.string(),
      merged_at: t.union([t.string(), t.nullType]),
    }),
  );

  if (Result.isErr(pull)) {
    return isNotFound(pull.value) || isGone(pull.value)
      ? Result.ok({ kind: 'unknown', number })
      : pull;
  }

  return Result.ok({
    kind: 'pull-request',
    number,
    title: pull.value.title,
    state: pull.value.state.toLowerCase(),
    merged: pull.value.merged_at !== null,
  });
};

const issueFactsOf = async (
  context: ReadContext,
  issue: IssueJson,
  viewer: Read<string>,
): Promise<IssueFacts> => {
  const [blockedBy, comments] = await Promise.all([
    readBlockedBy(context, issue.number, issue.issue_dependencies_summary),
    // An issue with no comments has no claim, and a thousand issues read that
    // way would spend a request each on nothing. The rest wait their turn in
    // the context's limit of requests in flight.
    issue.comments === 0
      ? Promise.resolve(Result.ok([]))
      : readOwnComments(context, issue.number, viewer),
  ]);

  return {
    number: issue.number,
    state: issue.state.toLowerCase(),
    stateReason: issue.state_reason?.toLowerCase(),
    title: issue.title,
    body: issue.body ?? '',
    author: issue.user?.login ?? '',
    url: issue.html_url,
    labels: labelsOf(issue.labels),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    commentCount: issue.comments,
    blockedBy,
    comments,
  };
};

const readNumber = async (
  context: ReadContext,
  number: number,
  viewer: Read<string>,
): Promise<Read<NumberFacts>> => {
  const issue = await restGet(
    context,
    `issue #${number}`,
    `/issues/${number}`,
    IssueSchema,
  );

  if (Result.isErr(issue)) {
    return isGone(issue.value)
      ? readAsPullRequest(context, number)
      : isNotFound(issue.value)
        ? Result.ok({ kind: 'unknown', number })
        : issue;
  }

  // A transferred issue answers, redirected, as another repository's.
  if (!answersAsContext(issue.value.repository_url, context)) {
    return Result.ok({ kind: 'unknown', number });
  }

  const { pull_request: pullRequest } = issue.value;

  if (pullRequest === undefined) {
    return Result.ok({
      kind: 'issue',
      facts: await issueFactsOf(context, issue.value, viewer),
    });
  }

  return pullRequest.merged_at === undefined
    ? readAsPullRequest(context, number)
    : Result.ok({
        kind: 'pull-request',
        number,
        title: issue.value.title,
        state: issue.value.state.toLowerCase(),
        merged: pullRequest.merged_at !== null,
      });
};

type NumberFacts =
  Readonly<{ kind: 'issue'; facts: IssueFacts }> | ReferenceFacts;

/**
 * How many issues block one, which GitHub sends beside an issue where it keeps
 * dependencies; absent or null where it does not.
 */
export const DependenciesSummarySchema = t.optional(
  t.union([t.record({ total_blocked_by: t.number() }), t.nullType]),
);

export type DependenciesSummary = t.TypeOf<typeof DependenciesSummarySchema>;

const LabelSchema = t.record({
  name: t.string(),
  color: t.string(),
  description: t.union([t.string(), t.nullType]),
});

const IssueSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.union([t.string(), t.nullType]),
  state: t.string(),
  state_reason: t.optional(t.union([t.string(), t.nullType])),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
  html_url: t.string(),
  repository_url: t.string(),
  labels: t.array(LabelSchema),
  created_at: t.string(),
  updated_at: t.string(),
  comments: t.number(),
  issue_dependencies_summary: DependenciesSummarySchema,
  pull_request: t.optional(
    t.record({ merged_at: t.optional(t.union([t.string(), t.nullType])) }),
  ),
});

type IssueJson = t.TypeOf<typeof IssueSchema>;

const ClosedPullSchema = t.record({
  number: t.number(),
  title: t.string(),
  body_html: RenderedBodySchema,
  user: t.union([t.record({ login: t.string() }), t.nullType]),
  html_url: t.string(),
  labels: t.array(LabelSchema),
  merged_at: t.union([t.string(), t.nullType]),
  merge_commit_sha: t.union([t.string(), t.nullType]),
  updated_at: t.string(),
  head: t.record({ ref: t.string(), sha: t.string() }),
  base: t.record({ ref: t.string() }),
});
