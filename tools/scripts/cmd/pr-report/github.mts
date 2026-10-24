/** Everything that talks to GitHub, and nothing that decides. */

import {
  anyRunInProgress,
  closingIssuesIn,
  parseMergeAfter,
  readQueueComments,
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
} from 'pr-report-core';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { send } from '../../lib/github-api.mjs';
import { parseJson } from '../../lib/json.mjs';
import { parseClosingIssueRefs } from './linked-issues.mjs';

/**
 * How many pull requests are read. A repository with more open than this has
 * a different problem than an unreadable report, so this fails loudly rather
 * than paginating and reporting half of it as the whole.
 */
const PAGE_SIZE = 100;

/**
 * How many pages of check runs, or of workflow runs, one commit may have. A
 * bound rather than a `while (true)`: a paginating loop against an answer that
 * never says it has ended is the one bug in a read-only report that costs a
 * rate limit.
 */
const MAX_CHECK_RUN_PAGES = 10;

const PullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.union([t.string(), t.nullType]),
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
  // Only its presence is read: what the report answers is whether anything
  // will land the pull request once the checks go green.
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
   * The commits the head has that the base does not, oldest first, so the
   * last is the head commit — read for its date, which comes free with the
   * counts rather than as a request of its own. Truncated on a long branch,
   * which is why its length is checked against `ahead_by` before use.
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
 * GitHub answers pull requests from the issues endpoint too, and the only
 * thing telling one apart in the answer is the `pull_request` key.
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

const WorkflowRunsSchema = t.record({
  total_count: t.number(),
  workflow_runs: t.array(
    t.record({
      check_suite_id: t.union([t.number(), t.nullType]),
      workflow_id: t.number(),
      status: t.union([t.string(), t.nullType]),
    }),
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
  facts: (
    repo: RepoRef,
  ) => Promise<Result<readonly PullRequestFacts[], string>>;
  /**
   * The pull requests that landed in the last `withinDays` days, newest
   * first. One request: the closed list, sorted by when it last changed.
   */
  merged: (
    repo: RepoRef,
    withinDays: number,
    limit: number,
  ) => Promise<Result<readonly MergedPullRequest[], string>>;
  /**
   * What the queue's comments say on each of `pulls` — the set-aside comment
   * `unblock-prs` writes and the claim of whoever is fixing it — by the
   * token's own account, which is what both are trusted by. Empty without a
   * token, or one whose account cannot be read.
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
   * Whether each of `numbers` is an open issue, and what its body declares
   * with `Start-After:`: one request each, for the issues the open pull
   * requests close that the open list did not cover. One that cannot be read
   * is left out, and declares nothing.
   */
  issueBodies: (
    repo: RepoRef,
    numbers: readonly number[],
  ) => Promise<ReadonlyMap<number, IssueBody>>;
  /**
   * Where each of `numbers` — what the issues' `Start-After:` names beyond
   * the open lists — stands: one request each, an issue or a pull request
   * alike. One that cannot be read is left out, and is unknown.
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
 * Unauthenticated works because the repository is public, and one report a
 * day fits inside the 60 requests an hour an anonymous caller gets — roughly
 * three per pull request, for the comparison and the two kinds of check.
 * A token raises that to 5000 and, through one GraphQL query, replaces the
 * issue links read out of the bodies with the ones GitHub itself holds.
 */
export const createClient = (
  token: string | undefined,
  baseUrl = 'https://api.github.com',
): Client => {
  /**
   * Set by the first answer that says the quota is spent. Every call after
   * one of those fails the same way, and each failure is swallowed into
   * "nothing reported" — a branch with no commit counts and a pull request
   * with no checks. A report that says that is worse than no report, so the
   * flag turns the whole run into one error naming the cause.
   */
  const mut_state = { rateLimited: false };

  /**
   * One call. A body makes it a POST, which is only ever the GraphQL query —
   * everything else this reads is a GET, so there is nothing to configure.
   */
  const request = async (
    route: string,
    body?: string,
  ): Promise<Result<string, string>> => {
    const response = await send({
      url: `${baseUrl}${route}`,
      method: body === undefined ? 'GET' : 'POST',
      token,
      accept: 'application/vnd.github+json',
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
  ): Promise<Result<A, string>> => {
    const text = await request(route);

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
      // Only when the list is whole: on a branch too long for one answer
      // the last commit listed is not the head. A branch level with its
      // base has no commit of its own to date.
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
   * contributes two codecov runs, and the aggregates, the matrix jobs and
   * the gates are on top of that. A commit that overflows the page would
   * quietly lose whichever required contexts fell off the end, and the
   * report would call them "missing" — the one wording that reads as "CI has
   * not got to it yet" rather than "this report did not look".
   */
  const checkRuns = async (
    prefix: string,
    rounds: ReadonlyMap<number, CheckRunReport['round']>,
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
   * Which workflow each check suite on one commit is a run of, and whether
   * that run has finished — what the check runs do not say, and what tells
   * a newer round still going from an unrelated suite. Empty when it cannot
   * be read, which leaves the verdict as it was before rounds were read.
   */
  const workflowRounds = async (
    repo: RepoRef,
    sha: string,
  ): Promise<ReadonlyMap<number, CheckRunReport['round']>> => {
    const mut_rounds = new Map<number, CheckRunReport['round']>();

    for (const page of Arr.seq(MAX_CHECK_RUN_PAGES)) {
      const answered = await getJson(
        `/repos/${repo.owner}/${repo.name}/actions/runs?head_sha=${sha}&per_page=${PAGE_SIZE}&page=${page + 1}`,
        WorkflowRunsSchema,
      );

      if (Result.isErr(answered)) {
        return new Map();
      }

      for (const run of answered.value.workflow_runs) {
        if (run.check_suite_id !== null) {
          mut_rounds.set(run.check_suite_id, {
            workflowId: run.workflow_id,
            completed: run.status === 'completed',
          });
        }
      }

      if (
        Arr.isEmpty(answered.value.workflow_runs) ||
        (page + 1) * PAGE_SIZE >= answered.value.total_count
      ) {
        return mut_rounds;
      }
    }

    return new Map();
  };

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
    Readonly<{ reported: ReadonlyMap<string, ContextState>; running: boolean }>
  > => {
    const prefix = `/repos/${repo.owner}/${repo.name}/commits/${sha}` as const;

    const runs = await checkRuns(prefix, await workflowRounds(repo, sha));

    const statuses = await getJson(
      `${prefix}/status?per_page=${PAGE_SIZE}`,
      CombinedStatusSchema,
    );

    const runList = Result.isErr(runs) ? ([] as const) : runs.value;

    return {
      reported: reportedContexts(
        runList,
        Result.isErr(statuses) ? [] : statuses.value.statuses,
      ),
      running: anyRunInProgress(runList),
    };
  };

  /**
   * The issues of `repo` GitHub records as blocking `issue` — its issue
   * dependencies, read as its `Start-After:` is (`waitsFor`). Asked only
   * when the issue's summary says it has any, so an issue with none costs
   * nothing; one that cannot be read is taken as having none.
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

    const listed = await getJson(
      `/repos/${repo.owner}/${repo.name}/issues/${issue.number}/dependencies/blocked_by?per_page=${PAGE_SIZE}`,
      BlockedByListSchema,
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
   * The issues GitHub itself says each pull request closes — the sidebar
   * list, which includes a link made by hand and so knows more than the body
   * does. Only GraphQL exposes it, and GraphQL refuses an anonymous caller,
   * which is why this is the one thing a token buys.
   */
  const closingIssues = async (
    repo: RepoRef,
  ): Promise<ReadonlyMap<number, readonly LinkedIssue[]>> => {
    const query = [
      'query($owner: String!, $name: String!) {',
      '  repository(owner: $owner, name: $name) {',
      `    pullRequests(states: OPEN, first: ${PAGE_SIZE}) {`,
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

    const answered = await request(
      '/graphql',
      JSON.stringify({
        query,
        variables: { owner: repo.owner, name: repo.name },
      }),
    );

    if (Result.isErr(answered)) {
      return new Map();
    }

    const parsed = parseJson(answered.value, ClosingIssuesSchema, '/graphql');

    if (Result.isErr(parsed)) {
      return new Map();
    }

    return new Map(
      parsed.value.data.repository.pullRequests.nodes.map((node) => [
        node.number,
        closingIssuesIn(repo, node.closingIssuesReferences.nodes),
      ]),
    );
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

    queueComments: async (repo, defaultBranch, pulls) => {
      // Without a token this is refused, and nothing is trusted.
      const viewer = await getJson('/user', t.record({ login: t.string() }));

      const tip = await getJson(
        `/repos/${repo.owner}/${repo.name}/git/ref/heads/${defaultBranch}`,
        t.record({ object: t.record({ sha: t.string() }) }),
      );

      if (Result.isErr(viewer) || Result.isErr(tip)) {
        return new Map();
      }

      const nowEpochMs = Temporal.Now.instant().epochMilliseconds;

      const mut_read = new Map<number, QueueComments>();

      for (const pr of pulls) {
        // The first page, oldest first: each comment is edited in place, so
        // it stays where it was first posted.
        const listed = await getJson(
          `/repos/${repo.owner}/${repo.name}/issues/${pr.number}/comments?per_page=${PAGE_SIZE}`,
          CommentListSchema,
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
      // A full page rather than `limit`: pull requests come back from this
      // endpoint too and are filtered out after, so asking for exactly the
      // cap would let a run of recently updated pull requests crowd the
      // issues out.
      const listed = await getJson(
        `/repos/${repo.owner}/${repo.name}/issues?state=open&per_page=${PAGE_SIZE}&sort=updated&direction=desc`,
        IssueListSchema,
      );

      if (Result.isErr(listed)) {
        return listed;
      }

      const mut_issues: OpenIssue[] = [];

      for (const issue of listed.value
        .filter((each) => each.pull_request === undefined)
        .slice(0, limit)) {
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
      // closed pull requests by merge time, and `updated` is the closest
      // thing that is monotonic enough for a window this short. The filter
      // below is what decides membership; the sort only decides what one
      // page of a hundred contains, and a hundred pull requests updated more
      // recently than a merge inside the window is not a state this
      // repository reaches.
      const listed = await getJson(
        `/repos/${repo.owner}/${repo.name}/pulls?state=closed&per_page=${PAGE_SIZE}&sort=updated&direction=desc`,
        PullRequestListSchema,
      );

      if (Result.isErr(listed)) {
        return listed;
      }

      const cutoff =
        Temporal.Now.instant().epochMilliseconds -
        withinDays * 24 * 60 * 60 * 1000;

      const within = listed.value.filter((pr) => {
        if (pr.merged_at === null) {
          return false;
        }

        const at = Result.fromThrowable(
          () => Temporal.Instant.from(pr.merged_at ?? '').epochMilliseconds,
        );

        return Result.isOk(at) && at.value >= cutoff;
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

    facts: async (repo) => {
      const listed = await getJson(
        `/repos/${repo.owner}/${repo.name}/pulls?state=open&per_page=${PAGE_SIZE}&sort=created&direction=asc`,
        PullRequestListSchema,
      );

      if (Result.isErr(listed)) {
        return listed;
      }

      if (Arr.isFixedLengthArray(PAGE_SIZE, listed.value)) {
        return Result.err(
          `There are at least ${PAGE_SIZE} open pull requests; this reads one page and would report a part of them as the whole.`,
        );
      }

      const linked =
        token === undefined
          ? new Map<number, readonly LinkedIssue[]>()
          : await closingIssues(repo);

      const mut_facts: PullRequestFacts[] = [];

      for (const pr of listed.value) {
        const body = pr.body ?? '';

        const compared = await comparison(repo, pr.base.ref, pr.head.sha);

        const checks = await contextStates(repo, pr.head.sha);

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
          linkedIssues:
            linked.get(pr.number) ??
            parseClosingIssueRefs(body, repo).map((number) => ({
              number,
              title: '',
              url: `https://github.com/${repo.owner}/${repo.name}/issues/${number}`,
              state: 'unknown' as const,
            })),
        });
      }

      return mut_state.rateLimited
        ? Result.err(
            'The GitHub rate limit was spent part way through, so this report would have been missing commit counts and check verdicts without saying which.\nSet GH_TOKEN or GITHUB_TOKEN to raise it from 60 requests an hour to 5000.',
          )
        : Result.ok(mut_facts);
    },
  };
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
