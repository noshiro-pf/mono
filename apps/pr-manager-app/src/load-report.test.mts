import { Arr, isRecord, Json, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { REPORT_SOURCE } from './constants.mjs';
import { type Fetch, type FetchInit } from './graphql.mjs';
import { loadReport, type LoadedReport } from './load-report.mjs';

describe(loadReport, () => {
  test('reads the report, then how far each head is from its base', async () => {
    const { fetchImpl, sent } = answering(
      report([pullRequest({ number: 7 })]),
      followUpAnswer({ compare_7: { compare: { aheadBy: 1, behindBy: 3 } } }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(sent.length, 2);

    assert.isTrue(sent[1]?.query.includes('compare_7: ref(') ?? false);

    // The branch name travels as a variable, never inside the query text.
    assert.strictEqual(sent[1]?.variables['compare_7_base'], 'refs/heads/main');

    const entry = loaded.entries[0];

    assert.isDefined(entry);

    assert.deepStrictEqual(entry.comparison, { aheadBy: 1, behindBy: 3 });

    assert.deepStrictEqual(entry.checks, {
      verdict: 'passed',
      failed: [],
      pending: [],
      missing: [],
      required: 2,
    });

    assert.strictEqual(loaded.summary.behind, 1);
  });

  test('reads a check run and a commit status as the shared verdict does', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({
          number: 7,
          contexts: [
            checkRun('code-check-result / result', 'COMPLETED', 'FAILURE'),
            {
              __typename: 'StatusContext',
              context: 'no-skip-ci-label',
              state: 'EXPECTED',
              description: null,
            },
          ],
        }),
      ]),
      followUpAnswer({ compare_7: null }),
    );

    const loaded = await load(fetchImpl);

    const entry = loaded.entries[0];

    assert.isDefined(entry);

    assert.deepStrictEqual(entry.checks.failed, ['code-check-result / result']);

    // `EXPECTED` is a status nobody has reported yet: a wait, not a failure.
    assert.deepStrictEqual(entry.checks.pending, ['no-skip-ci-label']);

    // A base GitHub could not compare against is a gap, not a failure.
    assert.isUndefined(entry.comparison);
  });

  test('follows a page of check results that did not fit', async () => {
    const { fetchImpl, sent } = answering(
      report([
        pullRequest({
          number: 7,
          contexts: [
            checkRun('code-check-result / result', 'COMPLETED', 'SUCCESS'),
          ],
          contextsAfter: 'cursor-1',
        }),
      ]),
      followUpAnswer({
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
        contexts_7: {
          statusCheckRollup: {
            contexts: {
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [
                {
                  __typename: 'StatusContext',
                  context: 'no-skip-ci-label',
                  state: 'PENDING',
                  description: null,
                },
              ],
            },
          },
        },
      }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(sent[1]?.variables['contexts_7_after'], 'cursor-1');

    assert.deepStrictEqual(loaded.entries[0]?.checks.pending, [
      'no-skip-ci-label',
    ]);
  });

  test('reports a wait for a code owner', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({ number: 7, files: ['.github/workflows/release.yml'] }),
      ]),
      followUpAnswer({ compare_7: { compare: { aheadBy: 1, behindBy: 0 } } }),
    );

    const loaded = await load(fetchImpl);

    const entry = loaded.entries[0];

    assert.isDefined(entry);

    assert.deepStrictEqual(entry.codeOwnerReview, {
      state: 'required',
      paths: ['.github/workflows/release.yml'],
      owners: ['noshiro-pf'],
      authorOwns: false,
    });

    assert.strictEqual(loaded.summary.awaitingReview, 1);
  });

  test('reports what unblock-prs said when it set a pull request aside', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({
          number: 7,
          contexts: Arr.toPushed(PASSING, setAsideStatus(BASE_TIP)),
        }),
        pullRequest({
          number: 8,
          contexts: Arr.toPushed(PASSING, setAsideStatus('b'.repeat(40))),
        }),
        pullRequest({ number: 9 }),
      ]),
      followUpAnswer({
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_8: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_9: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(loaded.entries[0]?.setAside, {
      reason: 'rebase-failed',
      baseSha: BASE_TIP,
      detail: 'rebase conflicts',
      current: true,
    });

    // Set aside against a base that has moved since: the next run retries it.
    assert.isFalse(loaded.entries[1]?.setAside?.current ?? true);

    assert.isUndefined(loaded.entries[2]?.setAside);

    // Its own status is not a required context, so the verdict is untouched.
    assert.strictEqual(loaded.entries[0]?.checks.verdict, 'passed');

    assert.strictEqual(loaded.summary.setAside, 1);
  });

  test('keeps what merged in the last week, newest first', async () => {
    const { fetchImpl } = answering(
      report(
        [],
        [
          merged(1, '2026-09-20T00:00:00Z'),
          merged(2, '2026-09-10T00:00:00Z'),
          merged(3, '2026-09-23T00:00:00Z'),
        ],
      ),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(
      loaded.merged.map(({ number }) => number),
      [3, 1],
    );
  });

  test('reads past an issue the token may not see', async () => {
    // #2022 closes an issue in a private repository; a token with no scopes
    // gets `null` in its place.
    const { fetchImpl } = answering(
      report([], [merged(2022, '2026-09-23T00:00:00Z', [null])]),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(loaded.merged[0]?.linkedIssues, []);
  });

  test("lists this repository's closing issues and no other", async () => {
    const { fetchImpl } = answering(
      report(
        [],
        [
          merged(2022, '2026-09-23T00:00:00Z', [
            closes(13, 'noshiro-pf/other'),
            closes(2021, 'noshiro-pf/mono'),
          ]),
        ],
      ),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(
      loaded.merged[0]?.linkedIssues.map(({ number }) => number),
      [2021],
    );
  });

  test('refuses to report part of the open pull requests as the whole', async () => {
    const { fetchImpl } = answering(report([], [], 51));

    const { result } = await loadReport(REPORT_SOURCE, {
      token: 'token',
      nowMs: NOW_MS,
      fetchImpl,
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('51 open pull requests'));
  });

  test('words a token GitHub will not take', async () => {
    const { result } = await loadReport(REPORT_SOURCE, {
      token: 'token',
      nowMs: NOW_MS,
      fetchImpl: refusingTheToken,
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('would not accept the token'));
  });

  test("passes on GitHub's own words when it refuses the query", async () => {
    const { result } = await loadReport(REPORT_SOURCE, {
      token: 'token',
      nowMs: NOW_MS,
      fetchImpl: refusingTheQuery,
    });

    assert.isTrue(Result.isErr(result));

    assert.isTrue(result.value.includes('API rate limit exceeded'));
  });

  test('sends the token, and reads the budget GitHub reports back', async () => {
    const mut_headers: FetchInit['headers'][] = [];

    const fetchImpl: Fetch = (_, init) => {
      mut_headers.push(init.headers);

      return Promise.resolve(
        Response.json(report([]), {
          headers: {
            'x-ratelimit-remaining': '4990',
            'x-ratelimit-limit': '5000',
            'x-ratelimit-reset': '1790000000',
          },
        }),
      );
    };

    const { rateLimit } = await loadReport(REPORT_SOURCE, {
      token: 'secret',
      nowMs: NOW_MS,
      fetchImpl,
    });

    assert.strictEqual(mut_headers[0]?.['Authorization'], 'Bearer secret');

    assert.deepStrictEqual(rateLimit, {
      remaining: 4990,
      limit: 5000,
      resetEpochMs: 1_790_000_000_000,
    });
  });
});

const refusingTheToken: Fetch = () =>
  Promise.resolve(new Response('', { status: 401 }));

const refusingTheQuery: Fetch = () =>
  Promise.resolve(
    Response.json({
      data: null,
      errors: [{ message: 'API rate limit exceeded', type: 'RATE_LIMITED' }],
    }),
  );

/** 2026-09-24T00:00:00Z. */
const NOW_MS = 1_790_208_000_000;

const load = async (fetchImpl: Fetch): Promise<LoadedReport> => {
  const { result } = await loadReport(REPORT_SOURCE, {
    token: 'token',
    nowMs: NOW_MS,
    fetchImpl,
  });

  assert.isTrue(Result.isOk(result));

  return result.value;
};

/**
 * A `fetch` that answers each request with the next of `bodies`, and keeps
 * what it was asked.
 */
const answering = (
  ...bodies: readonly unknown[]
): Readonly<{
  fetchImpl: Fetch;
  sent: readonly Readonly<{
    query: string;
    variables: ReadonlyRecord<string, unknown>;
  }>[];
}> => {
  const mut_sent: Readonly<{
    query: string;
    variables: ReadonlyRecord<string, unknown>;
  }>[] = [];

  const fetchImpl: Fetch = (_, init) => {
    const parsed = Json.parse(init.body);

    const request = Result.isOk(parsed) ? parsed.value : undefined;

    const variables = isRecord(request) ? request['variables'] : undefined;

    mut_sent.push({
      query:
        isRecord(request) && typeof request['query'] === 'string'
          ? request['query']
          : '',
      variables: isRecord(variables) ? variables : {},
    });

    return Promise.resolve(Response.json(bodies[mut_sent.length - 1] ?? {}));
  };

  return { fetchImpl, sent: mut_sent };
};

const RULESET = JSON.stringify({
  rules: [
    {
      type: 'pull_request',
      parameters: { require_code_owner_review: true },
    },
    {
      type: 'required_status_checks',
      parameters: {
        required_status_checks: [
          { context: 'code-check-result / result' },
          { context: 'no-skip-ci-label' },
        ],
      },
    },
  ],
});

const report = (
  openNodes: readonly unknown[],
  mergedNodes: readonly unknown[] = [],
  totalCount: number = openNodes.length,
): unknown =>
  ({
    data: {
      repository: {
        ruleset: { text: RULESET },
        codeOwners: { text: '/.github/workflows/ @noshiro-pf\n' },
        open: { totalCount, nodes: openNodes },
        merged: { nodes: mergedNodes },
      },
    },
  }) as const;

const followUpAnswer = (fields: ReadonlyRecord<string, unknown>): unknown =>
  ({
    data: { repository: fields },
  }) as const;

const checkRun = (
  checkName: string,
  runStatus: string,
  conclusion: string | null,
): unknown =>
  ({
    __typename: 'CheckRun',
    databaseId: 1,
    name: checkName,
    status: runStatus,
    conclusion,
    checkSuite: { databaseId: 1 },
  }) as const;

const PASSING = [
  checkRun('code-check-result / result', 'COMPLETED', 'SUCCESS'),
  {
    __typename: 'StatusContext',
    context: 'no-skip-ci-label',
    state: 'SUCCESS',
    description: null,
  },
] as const;

/** Where `main` is in every answer here. */
const BASE_TIP = 'a'.repeat(40);

/** The status `unblock-prs` leaves on a pull request it set aside. */
const setAsideStatus = (baseSha: string): unknown =>
  ({
    __typename: 'StatusContext',
    context: 'unblock-prs',
    state: 'FAILURE',
    description: `rebase-failed at ${baseSha}: rebase conflicts`,
  }) as const;

const pullRequest = ({
  number,
  contexts = PASSING,
  contextsAfter,
  files = ['libs/x/src/a.mts'],
}: Readonly<{
  number: number;
  contexts?: readonly unknown[];
  contextsAfter?: string;
  files?: readonly string[];
}>): unknown =>
  ({
    number,
    title: `Pull request ${number}`,
    body: '',
    isDraft: false,
    url: `https://github.com/noshiro-pf/mono/pull/${number}`,
    updatedAt: '2026-09-23T00:00:00Z',
    author: { login: 'someone' },
    autoMergeRequest: null,
    headRefName: `branch-${number}`,
    headRefOid: `sha-${number}`,
    baseRefName: 'main',
    baseRef: { target: { oid: BASE_TIP } },
    labels: { nodes: [] },
    closingIssuesReferences: { nodes: [] },
    latestOpinionatedReviews: { nodes: [] },
    files: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: files.map((path) => ({ path })),
    },
    commits: {
      nodes: [
        {
          commit: {
            statusCheckRollup: {
              contexts: {
                pageInfo: {
                  hasNextPage: contextsAfter !== undefined,
                  endCursor: contextsAfter ?? null,
                },
                nodes: contexts,
              },
            },
          },
        },
      ],
    },
  }) as const;

const merged = (
  number: number,
  mergedAt: string,
  closingIssues: readonly unknown[] = [],
): unknown =>
  ({
    number,
    title: `Merged ${number}`,
    url: `https://github.com/noshiro-pf/mono/pull/${number}`,
    mergedAt,
    headRefName: `branch-${number}`,
    baseRefName: 'main',
    author: { login: 'someone' },
    labels: { nodes: [] },
    closingIssuesReferences: { nodes: closingIssues },
  }) as const;

/** A closing issue as GraphQL answers it, in the repository given. */
const closes = (number: number, nameWithOwner: string): unknown =>
  ({
    number,
    title: `Issue ${number}`,
    url: `https://github.com/${nameWithOwner}/issues/${number}`,
    state: 'CLOSED',
    repository: { nameWithOwner },
  }) as const;
