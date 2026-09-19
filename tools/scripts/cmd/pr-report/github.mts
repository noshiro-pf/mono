/** Everything that talks to GitHub, and nothing that decides. */

import { Arr, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { classifyCheckRun, classifyCommitStatus } from './checks.mjs';
import { parseClosingIssueRefs } from './linked-issues.mjs';
import {
  type Comparison,
  type ContextState,
  type LinkedIssue,
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

const PullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.union([t.string(), t.nullType]),
  draft: t.boolean(),
  html_url: t.string(),
  updated_at: t.string(),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
  labels: t.array(t.record({ name: t.string() })),
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
  check_runs: t.array(
    t.record({
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

    if (Result.isErr(text)) return text;

    return parseJson(text.value, schema, route);
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

    const runs = await getJson(
      `${prefix}/check-runs?per_page=${PAGE_SIZE}`,
      CheckRunsSchema,
    );

    const statuses = await getJson(
      `${prefix}/status?per_page=${PAGE_SIZE}`,
      CombinedStatusSchema,
    );

    const fromRuns: readonly (readonly [string, ContextState])[] = Result.isErr(
      runs,
    )
      ? ([] as const)
      : runs.value.check_runs.map(({ name, status, conclusion }) => [
          name,
          classifyCheckRun(status, conclusion ?? undefined),
        ]);

    const fromStatuses: readonly (readonly [string, ContextState])[] =
      Result.isErr(statuses)
        ? ([] as const)
        : statuses.value.statuses.map(({ context, state }) => [
            context,
            classifyCommitStatus(state),
          ]);

    // A commit status and a check run of the same name would be the same
    // context reported twice; the status is read second and wins, which is
    // the order GitHub itself resolves them in.
    const mut_states = new Map<string, ContextState>(fromRuns);

    for (const [name, state] of fromStatuses) {
      mut_states.set(name, state);
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
          labels: pr.labels.map((label) => label.name),
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
