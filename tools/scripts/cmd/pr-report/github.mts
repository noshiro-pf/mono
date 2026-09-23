/** Everything that talks to GitHub, and nothing that decides. */

import { Arr, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  classifyCommitStatus,
  combineContextStates,
  statesFromCheckRuns,
  type CheckRunReport,
} from './checks.mjs';
import { parseClosingIssueRefs } from './linked-issues.mjs';
import {
  type Comparison,
  type ContextState,
  type Label,
  type LinkedIssue,
  type MergedPullRequest,
  type PullRequestFacts,
  type RepoRef,
} from './types.mjs';

const API_VERSION = '2022-11-28';

/**
 * How many pull requests are read. A repository with more open than this has
 * a different problem than an unreadable report, so this fails loudly rather
 * than paginating and reporting half of it as the whole.
 */
const PAGE_SIZE = 100;

/**
 * How many pages of check runs one commit may have. A bound rather than a
 * `while (true)`: a paginating loop against an answer that never says it has
 * ended is the one bug in a read-only report that costs a rate limit.
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
  head: t.record({ ref: t.string(), sha: t.string() }),
  base: t.record({ ref: t.string() }),
});

const PullRequestListSchema = t.array(PullRequestSchema);

const ComparisonSchema = t.record({
  ahead_by: t.number(),
  behind_by: t.number(),
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

const CombinedStatusSchema = t.record({
  statuses: t.array(t.record({ context: t.string(), state: t.string() })),
});

const ClosingIssuesSchema = t.record({
  data: t.record({
    repository: t.record({
      pullRequests: t.record({
        nodes: t.array(
          t.record({
            number: t.number(),
            closingIssuesReferences: t.record({
              nodes: t.array(
                t.record({
                  number: t.number(),
                  title: t.string(),
                  url: t.string(),
                  state: t.string(),
                }),
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
    const response = await fetch(`${baseUrl}${route}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      },
      body,
    });

    const text = await response.text();

    if (response.ok) return Result.ok(text);

    // Told apart from any other 403, because it is the one failure a reader
    // can do something about without reading the body of the answer.
    const rateLimited = response.headers.get('x-ratelimit-remaining') === '0';

    if (rateLimited) {
      mut_state.rateLimited = true;
    }

    return Result.err(
      [
        `${route} answered ${response.status} ${response.statusText}`,
        rateLimited
          ? 'The rate limit is spent. Set GITHUB_TOKEN to raise it from 60 requests an hour to 5000.'
          : text.slice(0, 500),
      ].join('\n'),
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
  ): Promise<Comparison | undefined> => {
    const compared = await getJson(
      // A base with a slash in it has to be escaped, and only the slash:
      // GitHub reads `compare/{base}...{head}` as one path segment.
      `/repos/${repo.owner}/${repo.name}/compare/${base.replaceAll('/', '%2F')}...${headSha}`,
      ComparisonSchema,
    );

    return Result.isErr(compared)
      ? undefined
      : {
          aheadBy: compared.value.ahead_by,
          behindBy: compared.value.behind_by,
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
  ): Promise<Result<readonly CheckRunReport[], string>> => {
    const mut_collected: CheckRunReport[] = [];

    for (const page of Arr.seq(MAX_CHECK_RUN_PAGES)) {
      const answered = await getJson(
        `${prefix}/check-runs?per_page=${PAGE_SIZE}&page=${page + 1}`,
        CheckRunsSchema,
      );

      if (Result.isErr(answered)) return answered;

      for (const run of answered.value.check_runs) {
        mut_collected.push({
          id: run.id,
          checkSuiteId: run.check_suite.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion ?? undefined,
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
   * What every context has reported on one commit, from both places GitHub
   * keeps them. The aggregate jobs are check runs; `no-skip-ci-label` is a
   * commit status, so reading only the first would report the context that
   * holds every labelled pull request as missing.
   */
  const contextStates = async (
    repo: RepoRef,
    sha: string,
  ): Promise<ReadonlyMap<string, ContextState>> => {
    const prefix = `/repos/${repo.owner}/${repo.name}/commits/${sha}` as const;

    const runs = await checkRuns(prefix);

    const statuses = await getJson(
      `${prefix}/status?per_page=${PAGE_SIZE}`,
      CombinedStatusSchema,
    );

    const fromRuns = Result.isErr(runs)
      ? new Map<string, ContextState>()
      : statesFromCheckRuns(runs.value);

    const fromStatuses: readonly (readonly [string, ContextState])[] =
      Result.isErr(statuses)
        ? ([] as const)
        : statuses.value.statuses.map(({ context, state }) => [
            context,
            classifyCommitStatus(state),
          ]);

    // A commit status and a check run of the same name are two requirements,
    // not one reported twice: GitHub asks both to pass. So the stricter of
    // the two is kept rather than whichever was read second.
    const mut_states = new Map<string, ContextState>(fromRuns);

    for (const [name, state] of fromStatuses) {
      const reported = mut_states.get(name);

      mut_states.set(
        name,
        reported === undefined ? state : combineContextStates(reported, state),
      );
    }

    return mut_states;
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
      '          nodes { number title url state }',
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

    if (Result.isErr(answered)) return new Map();

    const parsed = parseJson(answered.value, ClosingIssuesSchema, '/graphql');

    if (Result.isErr(parsed)) return new Map();

    return new Map(
      parsed.value.data.repository.pullRequests.nodes.map((node) => [
        node.number,
        node.closingIssuesReferences.nodes.map((issue) => ({
          number: issue.number,
          title: issue.title,
          url: issue.url,
          state:
            issue.state === 'CLOSED' ? ('closed' as const) : ('open' as const),
        })),
      ]),
    );
  };

  return {
    authenticated: token !== undefined,

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

      if (Result.isErr(listed)) return listed;

      const cutoff =
        Temporal.Now.instant().epochMilliseconds -
        withinDays * 24 * 60 * 60 * 1000;

      const within = listed.value.filter((pr) => {
        if (pr.merged_at === null) return false;

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

      if (Result.isErr(listed)) return listed;

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
          url: pr.html_url,
          updatedAt: pr.updated_at,
          comparison: await comparison(repo, pr.base.ref, pr.head.sha),
          reported: await contextStates(repo, pr.head.sha),
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
            'The GitHub rate limit was spent part way through, so this report would have been missing commit counts and check verdicts without saying which.\nSet GITHUB_TOKEN or GH_TOKEN to raise it from 60 requests an hour to 5000.',
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

/** `owner/name`, as it is written everywhere else. */
export const parseRepoRef = (raw: string): Result<RepoRef, string> => {
  const parts = raw.split('/');

  if (!Arr.isFixedLengthArray(2, parts)) {
    return Result.err(`expected owner/name, got ${JSON.stringify(raw)}`);
  }

  const [owner, name] = parts;

  return owner === '' || name === ''
    ? Result.err(`expected owner/name, got ${JSON.stringify(raw)}`)
    : Result.ok({ owner, name });
};

const parseJson = <A,>(
  text: string,
  schema: t.Type<A>,
  route: string,
): Result<A, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    return Result.err(`${route} did not answer JSON: ${parsed.value}`);
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(
        `${route} answered an unexpected shape:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
      )
    : Result.ok(validated.value);
};
