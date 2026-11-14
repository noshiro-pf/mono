/** Everything that talks to GitHub, and nothing that decides. */

import {
  anyRunInProgress,
  closingIssuesIn,
  closingKeywordIssuesIn,
  epochMsOf,
  parseMergeAfter,
  readBranchRequirements,
  readQueueComments,
  readWorkflowRounds,
  referenceStatusOf,
  reportedContexts,
  waitsFor,
  type CheckRunReport,
  type Comparison,
  type ContextState,
  type Label,
  type LinkedIssue,
  type MergedPullRequest,
  type OpenIssue,
  type PullRequestFacts,
  type QueueComments,
  type ReferenceStatus,
  type RepoRef,
  type WorkflowRound,
} from 'pr-report-core';
import { Arr, asUint32, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  collectPages,
  currentEpochMs,
  parseJson,
  send,
} from '../lib/index.mjs';
import { describeUnreadableChecks } from './checks-unreadable.mjs';
import { parseClosingIssueRefs } from './linked-issues.mjs';

/** The most GitHub answers in one page of a paged list. */
const PAGE_SIZE = 100;

/**
 * How many pages of check runs, or of workflow runs, one commit may have. A
 * bound rather than a `while (true)`: a paginating loop against an answer that
 * never says it has ended is the one bug in a read-only report that costs a
 * rate limit.
 */
const MAX_CHECK_RUN_PAGES = 10;

/**
 * Two thousand open issues and pull requests, for a cap past one page: every
 * one is read before the most recently updated are kept.
 */
const MAX_ISSUE_PAGES = 20;

const PullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.union([t.string(), t.nullType]),
  // GitHub's rendering of the body, sent only for the `full` media type, which
  // the open list alone asks for: where the closing keywords are read.
  body_html: t.optional(t.union([t.string(), t.nullType])),
  draft: t.boolean(),
  html_url: t.string(),
  updated_at: t.string(),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
  // The colour is read so that a chip can be the colour GitHub shows; the
  // description so that hovering one says what the label means.
  labels: t.array(
    t.record({
      name: t.string(),
      color: t.string(),
      description: t.union([t.string(), t.nullType]),
    }),
  ),
  merged_at: t.union([t.string(), t.nullType]),
  // `null` until auto-merge is armed, and an object describing it after.
  // Only its presence is read: what the report answers is whether anything will
  // land the pull request once the checks go green.
  auto_merge: t.union([t.record({}), t.nullType]),
  // `repo` is `null` for a head whose fork has been deleted. Read so that a
  // fork's branch is not taken for the parent of a stacked pull request.
  head: t.record({
    ref: t.string(),
    sha: t.string(),
    repo: t.union([t.record({ full_name: t.string() }), t.nullType]),
  }),
  base: t.record({ ref: t.string() }),
});

const PullRequestListSchema = t.array(PullRequestSchema);

const ComparisonSchema = t.record({
  ahead_by: t.number(),
  behind_by: t.number(),
  /**
   * The commits the head has that the base does not, oldest first, so the last
   * is the head commit — read for its date, which comes free with the counts
   * rather than as a request of its own. Truncated on a long branch, which is
   * why its length is checked against `ahead_by` before use.
   */
  commits: t.array(
    t.record({
      commit: t.record({ committer: t.record({ date: t.string() }) }),
    }),
  ),
});

const CheckRunsSchema = t.record({
  total_count: t.number(),
  check_runs: t.array(
    t.record({
      // Read so that two runs of one name can be told apart; which of them
      // counts is decided in `checks.mts`.
      id: t.number(),
      check_suite: t.record({ id: t.number() }),
      name: t.string(),
      status: t.string(),
      conclusion: t.union([t.string(), t.nullType]),
      completed_at: t.union([t.string(), t.nullType]),
    }),
  ),
});

/**
 * How many issues block one, which says whether asking which is worth a
 * request. Absent where GitHub does not send it.
 */
const DependenciesSummarySchema = t.optional(
  t.record({ total_blocked_by: t.number() }),
);

/**
 * GitHub answers pull requests from the issues endpoint too, and the only thing
 * telling one apart in the answer is the `pull_request` key.
 */
const IssueListSchema = t.array(
  t.record({
    number: t.number(),
    title: t.string(),
    /** Where `Start-After:` is read from. */
    body: t.union([t.string(), t.nullType]),
    issue_dependencies_summary: DependenciesSummarySchema,
    html_url: t.string(),
    created_at: t.string(),
    updated_at: t.string(),
    comments: t.number(),
    user: t.union([t.record({ login: t.string() }), t.nullType]),
    labels: t.array(
      t.record({
        name: t.string(),
        color: t.string(),
        description: t.union([t.string(), t.nullType]),
      }),
    ),
    pull_request: t.optional(t.record({})),
  }),
);

const IssueBodySchema = t.record({
  state: t.string(),
  body: t.union([t.string(), t.nullType]),
  pull_request: t.optional(t.record({})),
  issue_dependencies_summary: DependenciesSummarySchema,
});

/** The issues blocking one, of whichever repository. */
const BlockedByListSchema = t.array(
  t.record({ number: t.number(), repository_url: t.string() }),
);

/** An issue or a pull request, as the issues route answers for either. */
const ReferenceSchema = t.record({
  state: t.string(),
  state_reason: t.optional(t.union([t.string(), t.nullType])),
  pull_request: t.optional(
    t.record({ merged_at: t.union([t.string(), t.nullType]) }),
  ),
});

const CombinedStatusSchema = t.record({
  statuses: t.array(t.record({ context: t.string(), state: t.string() })),
});

const CommentListSchema = t.array(
  t.record({
    id: t.number(),
    body: t.union([t.string(), t.nullType]),
    user: t.union([t.record({ login: t.string() }), t.nullType]),
  }),
);

const ClosingIssuesSchema = t.record({
  data: t.record({
    repository: t.record({
      pullRequests: t.record({
        pageInfo: t.record({
          hasNextPage: t.boolean(),
          endCursor: t.union([t.string(), t.nullType]),
        }),
        nodes: t.array(
          t.record({
            number: t.number(),
            // `null` for an issue the token may not see, which
            // `closingIssuesIn` skips: one unreadable issue used to fail this
            // whole answer and drop every pull request's list with it.
            closingIssuesReferences: t.record({
              nodes: t.array(
                t.union([
                  t.record({
                    number: t.number(),
                    title: t.string(),
                    url: t.string(),
                    state: t.string(),
                    repository: t.record({ nameWithOwner: t.string() }),
                  }),
                  t.nullType,
                ]),
              ),
            }),
          }),
        ),
      }),
    }),
  }),
});

export type Client = Readonly<{
  /** Whether a token was found, which decides how much can be read. */
  authenticated: boolean;
  /** What pull requests target unless they are stacked. */
  defaultBranch: (repo: RepoRef) => Promise<Result<string, string>>;
  /**
   * The contexts GitHub requires on `branch`, every ruleset that applies to it
   * and a classic branch protection rule together (`pr-report-core`'s
   * `readBranchRequirements`).
   */
  requiredContexts: (
    repo: RepoRef,
    branch: string,
  ) => Promise<Result<readonly string[], string>>;
  /**
   * The open pull requests. With `{ checks: false }`, one page of the list,
   * and one page of a GraphQL query with a token, per hundred pull requests,
   * rather than about four requests per pull request: no comparison and no
   * check is read, for a caller that reads neither.
   */
  facts: (
    repo: RepoRef,
    options?: Readonly<{ checks: boolean }>,
  ) => Promise<Result<readonly PullRequestFacts[], string>>;
  /**
   * The pull requests that landed in the last `withinDays` days, newest first.
   * One request: the closed list, sorted by when it last changed.
   */
  merged: (
    repo: RepoRef,
    withinDays: number,
    limit: number,
  ) => Promise<Result<readonly MergedPullRequest[], string>>;
  /**
   * What the queue's comments say on each of `pulls` — the set-aside comment
   * `unblock-prs` writes and the claim of whoever is fixing it — by the token's
   * own account, which is what both are trusted by. Empty without a token, or
   * one whose account cannot be read.
   */
  queueComments: (
    repo: RepoRef,
    defaultBranch: string,
    pulls: readonly PullRequestFacts[],
  ) => Promise<ReadonlyMap<number, QueueComments>>;
  /** The open issues, most recently updated first, at most `limit`. */
  issues: (
    repo: RepoRef,
    limit: number,
  ) => Promise<Result<readonly OpenIssue[], string>>;
  /**
   * Whether each of `numbers` is an open issue, and what its body declares with
   * `Start-After:`: one request each, for the issues the open pull requests
   * close that the open list did not cover. One that cannot be read is left
   * out, and declares nothing.
   */
  issueBodies: (
    repo: RepoRef,
    numbers: readonly number[],
  ) => Promise<ReadonlyMap<number, IssueBody>>;
  /**
   * Where each of `numbers` — what the issues' `Start-After:` names beyond the
   * open lists — stands: one request each, an issue or a pull request alike.
   * One that cannot be read is left out, and is unknown.
   */
  references: (
    repo: RepoRef,
    numbers: readonly number[],
  ) => Promise<ReadonlyMap<number, ReferenceStatus>>;
}>;

/** What {@link Client.issueBodies} reads of one issue. */
export type IssueBody = Readonly<{
  open: boolean;
  startAfter: readonly number[];
}>;

/**
 * A client for the public REST API, using a token when one is in the
 * environment and going without when there is not.
 *
 * Unauthenticated works because the repository is public, and one report a day
 * fits inside the 60 requests an hour an anonymous caller gets — roughly three
 * per pull request, for the comparison and the two kinds of check.
 * A token raises that to 5000 and, through a GraphQL query read a hundred pull
 * requests a page, adds the issue links GitHub itself holds to the ones read
 * out of the bodies.
 */
export const createClient = (
  token: string | undefined,
  baseUrl = 'https://api.github.com',
): Client => {
  /**
   * Set by the first answer that says the quota is spent. Every call after one
   * of those fails the same way, and each failure is swallowed into "nothing
   * reported" — a branch with no commit counts and a pull request with no
   * checks. A report that says that is worse than no report, so the flag turns
   * the whole run into one error naming the cause.
   */
  const mut_state = { rateLimited: false };

  /**
   * One call. A body makes it a POST, which is only ever the GraphQL query —
   * everything else this reads is a GET, so the media type is all there is to
   * configure.
   */
  const request = async (
    route: string,
    { accept = JSON_MEDIA_TYPE, body }: RequestOptions = {},
  ): Promise<Result<string, string>> => {
    const response = await send({
      url: `${baseUrl}${route}`,
      method: body === undefined ? 'GET' : 'POST',
      token,
      accept,
      body,
    });

    if (Result.isOk(response)) {
      return response;
    }

    if (response.value.rateLimited) {
      mut_state.rateLimited = true;
    }

    const refused = `${route} answered ${response.value.message}` as const;

    return Result.err(
      response.value.rateLimited
        ? `${refused}\nThe rate limit is spent. Set GH_TOKEN or GITHUB_TOKEN to raise it from 60 requests an hour to 5000.`
        : refused,
    );
  };

  const getJson = async <A,>(
    route: string,
    schema: t.Type<A>,
    accept?: MediaType,
  ): Promise<Result<A, string>> => {
    const text = await request(route, { accept });

    return Result.isErr(text) ? text : parseJson(text.value, schema, route);
  };

  const comparison = async (
    repo: RepoRef,
    base: string,
    headSha: string,
  ): Promise<
    Readonly<{
      comparison: Comparison | undefined;
      headCommittedAt: string | undefined;
    }>
  > => {
    const compared = await getJson(
      // A base with a slash in it has to be escaped, and only the slash:
      // GitHub reads `compare/{base}...{head}` as one path segment.
      `/repos/${repo.owner}/${repo.name}/compare/${base.replaceAll('/', '%2F')}...${headSha}`,
      ComparisonSchema,
    );

    if (Result.isErr(compared)) {
      return { comparison: undefined, headCommittedAt: undefined };
    }

    const { ahead_by, behind_by, commits } = compared.value;

    return {
      comparison: { aheadBy: ahead_by, behindBy: behind_by },
      // Only when the list is whole: on a branch too long for one answer the
      // last commit listed is not the head. A branch level with its base has no
      // commit of its own to date.
      headCommittedAt:
        commits.length === ahead_by
          ? commits.at(-1)?.commit.committer.date
          : undefined,
    };
  };

  /**
   * Every check run on one commit, across as many pages as it takes.
   *
   * One page is not enough and has not been for a while: each package
   * contributes two codecov runs, and the aggregates, the matrix jobs and the
   * gates are on top of that. A commit that overflows the page would quietly
   * lose whichever required contexts fell off the end, and the report would
   * call them "missing" — the one wording that reads as "CI has not got to it
   * yet" rather than "this report did not look".
   */
  const checkRuns = async (
    prefix: string,
    rounds: ReadonlyMap<number, WorkflowRound>,
  ): Promise<Result<readonly CheckRunReport[], string>> => {
    const mut_collected: CheckRunReport[] = [];

    for (const page of Arr.seq(MAX_CHECK_RUN_PAGES)) {
      const answered = await getJson(
        `${prefix}/check-runs?per_page=${PAGE_SIZE}&page=${page + 1}`,
        CheckRunsSchema,
      );

      if (Result.isErr(answered)) {
        return answered;
      }

      for (const run of answered.value.check_runs) {
        mut_collected.push({
          id: run.id,
          checkSuiteId: run.check_suite.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion ?? undefined,
          completedAt: run.completed_at ?? undefined,
          round: rounds.get(run.check_suite.id),
        });
      }

      if (
        Arr.isEmpty(answered.value.check_runs) ||
        mut_collected.length >= answered.value.total_count
      ) {
        return Result.ok(mut_collected);
      }
    }

    return Result.err(
      `${prefix}/check-runs has more than ${PAGE_SIZE * MAX_CHECK_RUN_PAGES} runs, which is more than this reads.`,
    );
  };

  /**
   * Which workflow each check suite on one commit is a run of, whether that run
   * has finished, and when its latest attempt began (`pr-report-core`'s
   * `readWorkflowRounds`) — what the check runs do not say, and what tells a
   * newer round still going from an unrelated suite, and a re-run going on in a
   * suite from a finished one. Empty when it cannot be read, which leaves the
   * verdict as it was before rounds were read.
   */
  const workflowRounds = async (
    repo: RepoRef,
    sha: string,
  ): Promise<ReadonlyMap<number, WorkflowRound>> =>
    Result.unwrapOkOr(
      await readWorkflowRounds(sha, async (path, schema) =>
        getJson(`/repos/${repo.owner}/${repo.name}${path}`, schema),
      ),
      new Map<number, WorkflowRound>(),
    );

  /**
   * What every context has reported on one commit, from both places GitHub
   * keeps them. The aggregate jobs are check runs; `no-skip-ci-label` is a
   * commit status, so reading only the first would report the context that
   * holds every labelled pull request as missing.
   */
  const contextStates = async (
    repo: RepoRef,
    sha: string,
  ): Promise<
    Result<
      Readonly<{
        reported: ReadonlyMap<string, ContextState>;
        running: boolean;
      }>,
      string
    >
  > => {
    const prefix = `/repos/${repo.owner}/${repo.name}/commits/${sha}` as const;

    const rounds = await workflowRounds(repo, sha);

    const runs = await checkRuns(prefix, rounds);

    if (Result.isErr(runs)) {
      return Result.err(`check runs: ${runs.value}`);
    }

    const statuses = await getJson(
      `${prefix}/status?per_page=${PAGE_SIZE}`,
      CombinedStatusSchema,
    );

    if (Result.isErr(statuses)) {
      return Result.err(`commit statuses: ${statuses.value}`);
    }

    return Result.ok({
      reported: reportedContexts(
        runs.value,
        statuses.value.statuses,
        Date.now(),
        rounds,
      ),
      running: anyRunInProgress(runs.value, rounds),
    });
  };

  /**
   * The issues of `repo` GitHub records as blocking `issue` — its issue
   * dependencies, read as its `Start-After:` is (`waitsFor`). Asked only when
   * the issue's summary says it has any, so an issue with none costs nothing;
   * one that cannot be read is taken as having none.
   */
  const blockedByOf = async (
    repo: RepoRef,
    issue: Readonly<{
      number: number;
      issue_dependencies_summary?:
        Readonly<{ total_blocked_by: number }> | undefined;
    }>,
  ): Promise<readonly number[]> => {
    if ((issue.issue_dependencies_summary?.total_blocked_by ?? 0) === 0) {
      return [];
    }

    const listed = await collectPages(
      async (page) =>
        getJson(
          `/repos/${repo.owner}/${repo.name}/issues/${issue.number}/dependencies/blocked_by?per_page=${PAGE_SIZE}&page=${page}`,
          BlockedByListSchema,
        ),
      PAGE_SIZE,
    );

    const own =
      `https://api.github.com/repos/${repo.owner}/${repo.name}`.toLowerCase();

    return Result.isErr(listed)
      ? []
      : listed.value
          .filter(({ repository_url: url }) => url.toLowerCase() === own)
          .map(({ number }) => number);
  };

  /**
   * Every open pull request, oldest first, across as many pages as it takes.
   * Any page that cannot be read fails the whole list: the first pages reported
   * as the whole queue would hide the rest from every command that reads it.
   */
  const openPulls = async (
    repo: RepoRef,
  ): Promise<
    Result<readonly t.TypeOf<typeof PullRequestListSchema>[number][], string>
  > => {
    const listed = await collectPages(
      async (page) =>
        getJson(
          `/repos/${repo.owner}/${repo.name}/pulls?state=open&per_page=${PAGE_SIZE}&sort=created&direction=asc&page=${page}`,
          PullRequestListSchema,
          FULL_MEDIA_TYPE,
        ),
      PAGE_SIZE,
    );

    // Paging by offset, oldest first, the list can move while it is read, as
    // every list read through `collectPages` can. One closed among the pages
    // already read leaves the one at a page's edge out of that run; one
    // reopened there is itself left out, and repeats one at a page's edge,
    // which is dropped here. One opened goes on the end and moves nothing.
    // Reading it again is the fix for any of them.
    return Result.isErr(listed)
      ? Result.err(`the open pull requests: ${listed.value}`)
      : Result.ok(Arr.uniqBy(listed.value, ({ number }) => number));
  };

  /**
   * The issues GitHub itself says each pull request closes — the sidebar list,
   * which includes a link made by hand and so knows more than the body does.
   * Only GraphQL exposes it, and GraphQL refuses an anonymous caller, which is
   * why this is the one thing a token buys.
   *
   * It also knows less: a closing keyword is listed only for a pull request
   * into the default branch, so a stacked one answers an empty list. That is
   * why `linkedIssuesOf` joins this with the keywords rather than taking it as
   * the answer.
   */
  const closingIssues = async (
    repo: RepoRef,
    openCount: number,
  ): Promise<ReadonlyMap<number, readonly LinkedIssue[]>> => {
    const query = [
      'query($owner: String!, $name: String!, $after: String) {',
      '  repository(owner: $owner, name: $name) {',
      `    pullRequests(states: OPEN, first: ${PAGE_SIZE}, after: $after) {`,
      '      pageInfo { hasNextPage endCursor }',
      '      nodes {',
      '        number',
      '        closingIssuesReferences(first: 10) {',
      '          nodes { number title url state repository { nameWithOwner } }',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ].join('\n');

    const mut_linked = new Map<number, readonly LinkedIssue[]>();

    // A page that fails keeps the pages before it: the pull requests it would
    // have covered fall back to their keywords, as every one does when GraphQL
    // refuses outright.
    let mut_after: string | null = null;

    // A bound rather than a `while (true)`, as for {@link MAX_CHECK_RUN_PAGES}:
    // the pages the REST list just took, and one for any opened since.
    const maxPages = asUint32(Math.floor(openCount / PAGE_SIZE) + 2);

    for (const _page of Arr.seq(maxPages)) {
      const answered = await request('/graphql', {
        body: JSON.stringify({
          query,
          variables: { owner: repo.owner, name: repo.name, after: mut_after },
        }),
      });

      if (Result.isErr(answered)) {
        break;
      }

      const parsed = parseJson(answered.value, ClosingIssuesSchema, '/graphql');

      if (Result.isErr(parsed)) {
        break;
      }

      const { nodes, pageInfo } = parsed.value.data.repository.pullRequests;

      for (const node of nodes) {
        mut_linked.set(
          node.number,
          closingIssuesIn(repo, node.closingIssuesReferences.nodes),
        );
      }

      if (!pageInfo.hasNextPage || pageInfo.endCursor === null) {
        break;
      }

      mut_after = pageInfo.endCursor;
    }

    return mut_linked;
  };

  return {
    authenticated: token !== undefined,

    defaultBranch: async (repo) => {
      const answered = await getJson(
        `/repos/${repo.owner}/${repo.name}`,
        t.record({ default_branch: t.string() }),
      );

      return Result.isErr(answered)
        ? answered
        : Result.ok(answered.value.default_branch);
    },

    requiredContexts: async (repo, branch) =>
      Result.map(
        await readBranchRequirements(branch, async (path, schema) =>
          getJson(`/repos/${repo.owner}/${repo.name}${path}`, schema),
        ),
        ({ requiredContexts }) => requiredContexts,
      ),

    queueComments: async (repo, defaultBranch, pulls) => {
      // Without a token this is refused, and nothing is trusted.
      const viewer = await getJson('/user', t.record({ login: t.string() }));

      const tip = await getJson(
        `/repos/${repo.owner}/${repo.name}/git/ref/heads/${defaultBranch}`,
        t.record({ object: t.record({ sha: t.string() }) }),
      );

      if (Result.isErr(viewer) || Result.isErr(tip)) {
        return new Map<number, QueueComments>();
      }

      const nowEpochMs = currentEpochMs();

      const mut_read = new Map<number, QueueComments>();

      for (const pr of pulls) {
        // Every page, oldest first: each comment is edited in place, so it
        // stays where it was first posted, behind as many others as came after.
        const listed = await collectPages(
          async (page) =>
            getJson(
              `/repos/${repo.owner}/${repo.name}/issues/${pr.number}/comments?per_page=${PAGE_SIZE}&page=${page}`,
              CommentListSchema,
            ),
          PAGE_SIZE,
        );

        if (Result.isOk(listed)) {
          mut_read.set(
            pr.number,
            readQueueComments(
              Arr.generate(function* () {
                for (const { id, body, user } of listed.value) {
                  if (user?.login === viewer.value.login) {
                    yield { id, body: body ?? '' };
                  }
                }
              }),
              {
                headSha: pr.headSha,
                baseTip: tip.value.object.sha,
                nowEpochMs,
              },
            ),
          );
        }
      }

      return mut_read;
    },

    issues: async (repo, limit) => {
      // One page, most recently updated first, when the cap fits in one. Past
      // that, pages in the order the issues were opened, which does not move
      // while the pages are read as `updated` does, sorted afterwards.
      const paged = limit > PAGE_SIZE;

      const sort = paged ? 'created' : 'updated';

      const mut_listed: t.TypeOf<typeof IssueListSchema>[number][] = [];

      // Full pages rather than `limit`: pull requests come back from this
      // endpoint too and are filtered out after, so asking for exactly the cap
      // would let a run of recently updated pull requests crowd the issues out.
      for (const page of Arr.seq(paged ? MAX_ISSUE_PAGES : 1)) {
        const listed = await getJson(
          `/repos/${repo.owner}/${repo.name}/issues?state=open&per_page=${PAGE_SIZE}&sort=${sort}&direction=desc&page=${page + 1}`,
          IssueListSchema,
        );

        if (Result.isErr(listed)) {
          return listed;
        }

        // One opened while the pages are read moves the rest along by one, and
        // repeats the last of a page at the top of the next.
        const seen = new Set<number>(mut_listed.map(({ number }) => number));

        mut_listed.push(
          ...listed.value.filter(
            (each) => each.pull_request === undefined && !seen.has(each.number),
          ),
        );

        // All of them, not the first `limit` opened: the cap is on the most
        // recently updated.
        if (listed.value.length < PAGE_SIZE) {
          break;
        }
      }

      mut_listed.sort((a, b) => b.updated_at.localeCompare(a.updated_at));

      const mut_issues: OpenIssue[] = [];

      for (const issue of mut_listed.slice(0, limit)) {
        const blockedBy = await blockedByOf(repo, issue);

        mut_issues.push({
          number: issue.number,
          title: issue.title,
          author: issue.user?.login ?? 'unknown',
          url: issue.html_url,
          labels: labelsOf(issue.labels),
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          comments: issue.comments,
          startAfter: waitsFor(issue.body ?? '', blockedBy),
          misplacedMergeAfter: parseMergeAfter(issue.body ?? ''),
        });
      }

      return Result.ok(mut_issues);
    },

    issueBodies: async (repo, numbers) => {
      const mut_read = new Map<number, IssueBody>();

      for (const number of numbers) {
        const read = await getJson(
          `/repos/${repo.owner}/${repo.name}/issues/${number}`,
          IssueBodySchema,
        );

        // A pull request answers here too, and closes nothing it inherits.
        if (Result.isOk(read) && read.value.pull_request === undefined) {
          mut_read.set(number, {
            open: read.value.state === 'open',
            startAfter: waitsFor(
              read.value.body ?? '',
              await blockedByOf(repo, { number, ...read.value }),
            ),
          });
        }
      }

      return mut_read;
    },

    references: async (repo, numbers) => {
      const mut_read = new Map<number, ReferenceStatus>();

      for (const number of numbers) {
        const read = await getJson(
          `/repos/${repo.owner}/${repo.name}/issues/${number}`,
          ReferenceSchema,
        );

        if (Result.isErr(read)) {
          continue;
        }

        const {
          state,
          state_reason: stateReason,
          pull_request: pull,
        } = read.value;

        mut_read.set(
          number,
          referenceStatusOf(
            pull === undefined
              ? { kind: 'issue', state, stateReason: stateReason ?? undefined }
              : {
                  kind: 'pull-request',
                  state,
                  merged: pull.merged_at !== null,
                },
          ),
        );
      }

      return mut_read;
    },

    merged: async (repo, withinDays, limit) => {
      // Sorted by `updated`, not by when they merged: GitHub does not sort
      // closed pull requests by merge time, and `updated` is the closest thing
      // that is monotonic enough for a window this short. The filter below is
      // what decides membership; the sort only decides what one page of a
      // hundred contains, and a hundred pull requests updated more recently
      // than a merge inside the window is not a state this repository reaches.
      const listed = await getJson(
        `/repos/${repo.owner}/${repo.name}/pulls?state=closed&per_page=${PAGE_SIZE}&sort=updated&direction=desc`,
        PullRequestListSchema,
      );

      if (Result.isErr(listed)) {
        return listed;
      }

      const cutoff = currentEpochMs() - withinDays * 24 * 60 * 60 * 1000;

      const within = listed.value.filter((pr) => {
        if (pr.merged_at === null) {
          return false;
        }

        const at = epochMsOf(pr.merged_at);

        return at !== undefined && at >= cutoff;
      });

      return Result.ok(
        within
          .map((pr) => ({
            number: pr.number,
            title: pr.title,
            author: pr.user?.login ?? 'unknown',
            url: pr.html_url,
            headRef: pr.head.ref,
            baseRef: pr.base.ref,
            mergedAt: pr.merged_at ?? '',
            labels: labelsOf(pr.labels),
            // The text, not the rendering: this list is only displayed, so a
            // keyword read differently from GitHub costs a line of display,
            // whereas the rendering would enlarge the answer for every report.
            linkedIssues: parseClosingIssueRefs(pr.body ?? '', repo).map(
              (number) => ({
                number,
                title: '',
                url: `https://github.com/${repo.owner}/${repo.name}/issues/${number}`,
                state: 'unknown' as const,
              }),
            ),
          }))
          .toSorted((a, b) => b.mergedAt.localeCompare(a.mergedAt))
          .slice(0, limit),
      );
    },

    facts: async (repo, options) => {
      const readsChecks = options?.checks ?? true;

      // The links after the list rather than beside it: the list says how far
      // to page them, and a list that fails spends nothing on them.
      const listed = await openPulls(repo);

      if (Result.isErr(listed)) {
        return listed;
      }

      const linked =
        token === undefined
          ? new Map<number, readonly LinkedIssue[]>()
          : await closingIssues(repo, listed.value.length);

      const mut_facts: PullRequestFacts[] = [];

      const mut_unreadable: Readonly<{ number: number; error: string }>[] = [];

      for (const pr of listed.value) {
        const body = pr.body ?? '';

        const compared = readsChecks
          ? await comparison(repo, pr.base.ref, pr.head.sha)
          : ({ headCommittedAt: undefined, comparison: undefined } as const);

        const read = readsChecks
          ? await contextStates(repo, pr.head.sha)
          : Result.ok({
              reported: new Map<string, ContextState>(),
              running: false,
            } as const);

        if (Result.isErr(read)) {
          mut_unreadable.push({ number: pr.number, error: read.value });
        }

        const checks = Result.isErr(read)
          ? ({
              reported: new Map<string, ContextState>(),
              running: false,
            } as const)
          : read.value;

        mut_facts.push({
          number: pr.number,
          title: pr.title,
          body,
          author: pr.user?.login ?? 'unknown',
          isDraft: pr.draft,
          labels: labelsOf(pr.labels),
          autoMerge: pr.auto_merge !== null,
          headRef: pr.head.ref,
          headSha: pr.head.sha,
          baseRef: pr.base.ref,
          fromFork: pr.head.repo?.full_name !== `${repo.owner}/${repo.name}`,
          url: pr.html_url,
          updatedAt: pr.updated_at,
          headCommittedAt: compared.headCommittedAt,
          comparison: compared.comparison,
          reported: checks.reported,
          checksRunning: checks.running,
          linkedIssues: linkedIssuesOf(repo, pr, linked.get(pr.number)),
        });
      }

      if (mut_state.rateLimited) {
        return Result.err(
          'The GitHub rate limit was spent part way through, so this report would have been missing commit counts and check verdicts without saying which.\nSet GH_TOKEN or GITHUB_TOKEN to raise it from 60 requests an hour to 5000.',
        );
      }

      const unreadable = describeUnreadableChecks(mut_unreadable);

      return unreadable === undefined
        ? Result.ok(mut_facts)
        : Result.err(unreadable);
    },
  };
};

const JSON_MEDIA_TYPE = 'application/vnd.github+json';

/**
 * The media type whose answer carries `body_html` beside `body`. It nearly
 * doubles the size of the open list, which is why only that list asks for it.
 */
// Every caller of `facts` pays for it, the ones that never read `linkedIssues`
// included, so that every caller gets an open pull request's `linkedIssues`
// read the same way: an option to skip the rendering would make the field
// GitHub's reading for one caller and the text's for another, a difference no
// type shows.
const FULL_MEDIA_TYPE = 'application/vnd.github.full+json';

type MediaType = typeof FULL_MEDIA_TYPE | typeof JSON_MEDIA_TYPE;

type RequestOptions = Readonly<{
  accept?: MediaType | undefined;
  body?: string | undefined;
}>;

/**
 * The issues an open pull request closes: the ones GitHub links
 * (`closingIssuesReferences`, with their titles and states), then the ones its
 * body closes by keyword that GitHub did not link, of which only the number is
 * known.
 *
 * Both are read for every pull request, because neither holds the other: a link
 * made by hand is in no body, and a keyword on a stacked pull request is in no
 * `closingIssuesReferences`. The keywords come from GitHub's rendering, as
 * `start-issue`, `open-pr` and `unblock-prs` read them, so that the report
 * cannot disagree with them about what closes what; the text is read only for
 * an answer that carries no rendering.
 */
const linkedIssuesOf = (
  repo: RepoRef,
  pr: Readonly<{ body: string | null; body_html?: string | null | undefined }>,
  linked: readonly LinkedIssue[] | undefined,
): readonly LinkedIssue[] => {
  const known = new Set((linked ?? []).map(({ number }) => number));

  // GitHub always sends the rendering for the `full` media type, so the text is
  // read only behind something that drops it. It is read rather than taken as
  // "no keyword" because of which way each is wrong: an issue reported as
  // closed by nobody is handed out as startable, while a keyword the text reads
  // and GitHub would not costs one issue left waiting.
  const byKeyword =
    pr.body_html === undefined || pr.body_html === null
      ? parseClosingIssueRefs(pr.body ?? '', repo)
      : closingKeywordIssuesIn(repo, pr.body_html);

  return [
    ...(linked ?? []),
    ...byKeyword
      .filter((number) => !known.has(number))
      .map((number) => ({
        number,
        title: '',
        url: `https://github.com/${repo.owner}/${repo.name}/issues/${number}`,
        state: 'unknown' as const,
      })),
  ];
};

/**
 * The labels, as the report passes them on. GitHub sends a `null` description
 * for a label that has none; the report carries the empty string, so that
 * nothing downstream has to know the difference.
 */
const labelsOf = (
  labels: readonly Readonly<{
    name: string;
    color: string;
    description: string | null;
  }>[],
): readonly Label[] =>
  labels.map(({ name, color, description }) => ({
    name,
    color,
    description: description ?? '',
  }));
