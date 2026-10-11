import { writeSetAsideComment } from 'pr-report-core';
import { isRecord, Json, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { REPORT_SOURCE } from './constants.mjs';
import type { Fetch, FetchInit } from './graphql.mjs';
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
      passed: ['code-check-result / result', 'no-skip-ci-label'],
      failed: [],
      pending: [],
      skipped: [],
      missing: [],
      notRun: [],
      required: 2,
    });

    assert.strictEqual(loaded.summary.behind, 1);
  });

  test('reads when the head was committed, beside when anything changed', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({ number: 7, committedDate: '2026-09-21T03:04:05Z' }),
      ]),
      followUpAnswer({ compare_7: { compare: { aheadBy: 1, behindBy: 0 } } }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(
      loaded.entries[0]?.headCommittedAt,
      '2026-09-21T03:04:05Z',
    );

    assert.strictEqual(loaded.entries[0]?.updatedAt, '2026-09-23T00:00:00Z');
  });

  // #2031: the round before had skipped, and the round that replaced it had
  // not yet created its aggregate. The page showed a tick.
  test('keeps the verdict pending while anything on the head is running', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({
          number: 7,
          contexts: [
            checkRun('code-check-result / result', 'COMPLETED', 'SKIPPED'),
            checkRun('code-check (ws:fix:lint)', 'IN_PROGRESS', null),
            {
              __typename: 'StatusContext',
              context: 'no-skip-ci-label',
              state: 'SUCCESS',
              description: null,
            },
          ],
        }),
      ]),
      followUpAnswer({ compare_7: { compare: { aheadBy: 1, behindBy: 0 } } }),
    );

    const loaded = await load(fetchImpl);

    const entry = loaded.entries[0];

    assert.isDefined(entry);

    assert.strictEqual(entry.checksRunning, true);

    assert.strictEqual(entry.checks.verdict, 'pending');

    assert.deepStrictEqual(entry.checks.skipped, [
      'code-check-result / result',
    ]);

    assert.deepStrictEqual(entry.checks.passed, ['no-skip-ci-label']);
  });

  // #2191: two label events started two rounds, and the second cancelled the
  // first, whose aggregate concluded `failure` before the second had created
  // its own. The page called it failing.
  test('does not read a cancelled round as failing while a newer one runs', async () => {
    const codeCheck = { workflow: { databaseId: 359_266_435 } } as const;

    const { fetchImpl } = answering(
      report([
        pullRequest({
          number: 7,
          contexts: [
            checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', {
              databaseId: 103_247_630_670,
              status: 'COMPLETED',
              workflowRun: codeCheck,
            }),
            checkRun('code-check (ws:fix:lint)', 'COMPLETED', 'SUCCESS', {
              databaseId: 103_247_840_668,
              status: 'IN_PROGRESS',
              workflowRun: codeCheck,
            }),
            {
              __typename: 'StatusContext',
              context: 'no-skip-ci-label',
              state: 'SUCCESS',
              description: null,
            },
          ],
        }),
      ]),
      followUpAnswer({ compare_7: { compare: { aheadBy: 1, behindBy: 0 } } }),
    );

    const loaded = await load(fetchImpl);

    const entry = loaded.entries[0];

    assert.isDefined(entry);

    assert.strictEqual(entry.checksRunning, true);

    assert.strictEqual(entry.checks.verdict, 'pending');

    assert.deepStrictEqual(entry.checks.failed, []);

    assert.deepStrictEqual(entry.checks.pending, [
      'code-check-result / result',
    ]);
  });

  test('lists the open issues, and how many there are in all', async () => {
    const { fetchImpl } = answering(
      report([], [], 0, {
        totalCount: 42,
        nodes: [
          openIssue(2036, ['pr-manager-app']),
          // An issue the token may not see.
          null,
          openIssue(1976, []),
        ],
      }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(loaded.issues.totalCount, 42);

    assert.deepStrictEqual(loaded.issues.items, [
      {
        number: 2036,
        title: 'Issue 2036',
        author: 'someone',
        url: 'https://github.com/noshiro-pf/mono/issues/2036',
        labels: [{ name: 'pr-manager-app', color: 'ededed', description: '' }],
        createdAt: '2026-09-20T00:00:00Z',
        updatedAt: '2026-09-23T00:00:00Z',
        comments: 3,
      },
      {
        number: 1976,
        title: 'Issue 1976',
        author: 'someone',
        url: 'https://github.com/noshiro-pf/mono/issues/1976',
        labels: [],
        createdAt: '2026-09-20T00:00:00Z',
        updatedAt: '2026-09-23T00:00:00Z',
        comments: 3,
      },
    ]);
  });

  test('reads the Claude Code sessions out of the body', async () => {
    const url = 'https://claude.ai/code/session_015ESrbamCgMWqeNyk6SCZcL';

    const { fetchImpl } = answering(
      report([
        pullRequest({
          number: 7,
          body: `Adds a thing.\n\nClaude-Session: [Add a thing](${url})\n`,
        }),
        pullRequest({ number: 8 }),
      ]),
      followUpAnswer({ compare_7: null, compare_8: null }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(loaded.entries[0]?.claudeSessions, [
      { title: 'Add a thing', url },
    ]);

    assert.deepStrictEqual(loaded.entries[1]?.claudeSessions, []);
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
          headRefOid: HEAD,
          comments: [comment('LGTM', false), setAsideComment(BASE_TIP)],
        }),
        pullRequest({
          number: 8,
          headRefOid: HEAD,
          comments: [setAsideComment('b'.repeat(40))],
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
      headSha: HEAD,
      baseSha: BASE_TIP,
      retry: false,
      url: COMMENT_URL,
      current: true,
    });

    // Set aside against a base that has moved since: the next run retries it.
    assert.isFalse(loaded.entries[1]?.setAside?.current ?? true);

    assert.isUndefined(loaded.entries[2]?.setAside);

    assert.strictEqual(loaded.summary.setAside, 1);
  });

  test('reads only what the viewer wrote, at the head as it is now', async () => {
    const { fetchImpl } = answering(
      report([
        // Anyone can post a comment that looks like the script's.
        pullRequest({
          number: 7,
          headRefOid: HEAD,
          comments: [{ ...setAsideComment(BASE_TIP), viewerDidAuthor: false }],
        }),
        // Set aside at a head the branch has been pushed past.
        pullRequest({
          number: 8,
          comments: [setAsideComment(BASE_TIP)],
        }),
        pullRequest({
          number: 9,
          comments: [
            comment(
              '<!-- unblock-prs:set-aside resolved -->\n\nResolved.',
              true,
            ),
          ],
        }),
      ]),
      followUpAnswer({
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_8: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_9: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(
      loaded.entries.map((entry) => entry.setAside),
      [undefined, undefined, undefined],
    );
  });

  test('reads a stack out of the bases, and compares each layer with its own', async () => {
    const { fetchImpl, sent } = answering(
      report([
        pullRequest({ number: 7 }),
        pullRequest({ number: 8, baseRefName: 'branch-7' }),
        // A fork's branch of the same name is not #7's.
        pullRequest({ number: 9, baseRefName: 'branch-10' }),
        pullRequest({ number: 10, isCrossRepository: true }),
      ]),
      followUpAnswer({
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_8: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_9: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_10: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(
      sent[1]?.variables['compare_8_base'],
      'refs/heads/branch-7',
    );

    assert.deepStrictEqual(
      loaded.entries.map(({ number, stackedOn }) => [number, stackedOn]),
      [
        [7, undefined],
        [8, 7],
        [9, undefined],
        [10, undefined],
      ],
    );

    assert.deepStrictEqual(
      loaded.roots.map(({ number, children }) => [
        number,
        children.map((child) => child.number),
      ]),
      [
        [7, [8]],
        [9, []],
        [10, []],
      ],
    );
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

  // #1962: stacked on another pull request's branch, so GitHub links none of
  // its closing keywords until it is moved onto `main`, but marks them.
  test('lists an issue a stacked pull request closes by keyword', async () => {
    const { fetchImpl, sent } = answering(
      report([
        pullRequest({
          number: 1962,
          baseRefName: 'branch-1956',
          bodyHTML: keywordHtml('Closes', 2043),
        }),
      ]),
      followUpAnswer({ compare_1962: null }),
      followUpAnswer({ issue_2043: closes(2043, 'noshiro-pf/mono', 'OPEN') }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(sent.length, 3);

    assert.isTrue(sent[2]?.query.includes('issue_2043: issue(') ?? false);

    assert.strictEqual(sent[2]?.variables['issue_2043'], 2043);

    assert.deepStrictEqual(loaded.entries[0]?.linkedIssues, [
      {
        number: 2043,
        title: 'Issue 2043',
        url: 'https://github.com/noshiro-pf/mono/issues/2043',
        state: 'open',
      },
    ]);
  });

  test('asks nothing more for an issue GitHub already linked', async () => {
    const { fetchImpl, sent } = answering(
      report(
        [
          pullRequest({
            number: 2126,
            bodyHTML: keywordHtml('Closes', 2122),
            closingIssues: [closes(2122, 'noshiro-pf/mono')],
          }),
        ],
        [
          merged(
            2125,
            '2026-09-23T00:00:00Z',
            [closes(2121, 'noshiro-pf/mono')],
            keywordHtml('Closes', 2121),
          ),
        ],
      ),
      followUpAnswer({ compare_2126: null }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(sent.length, 2);

    assert.deepStrictEqual(
      loaded.entries[0]?.linkedIssues.map(({ number, state }) => ({
        number,
        state,
      })),
      [{ number: 2122, state: 'closed' }],
    );

    assert.deepStrictEqual(
      loaded.merged[0]?.linkedIssues.map(({ number }) => number),
      [2121],
    );
  });

  test('lists a keyword issue after the ones GitHub linked, each once', async () => {
    const { fetchImpl, sent } = answering(
      report(
        [],
        [
          merged(
            2000,
            '2026-09-23T00:00:00Z',
            [closes(1990, 'noshiro-pf/mono')],
            [keywordHtml('Fixes', 1995), keywordHtml('Closes', 1990)].join(
              '\n',
            ),
          ),
        ],
      ),
      followUpAnswer({ issue_1995: closes(1995, 'noshiro-pf/mono') }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(sent.length, 2);

    assert.deepStrictEqual(
      loaded.merged[0]?.linkedIssues.map(({ number }) => number),
      [1990, 1995],
    );
  });

  test('still lists by number an issue GitHub would not describe', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({
          number: 1962,
          baseRefName: 'branch-1956',
          bodyHTML: keywordHtml('Closes', 2043),
        }),
      ]),
      followUpAnswer({ compare_1962: null }),
      {
        data: { repository: { issue_2043: null } },
        errors: [
          {
            message: 'Could not resolve to an Issue with the number of 2043.',
            path: ['repository', 'issue_2043'],
          },
        ],
      },
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(loaded.entries[0]?.linkedIssues, [
      {
        number: 2043,
        title: '',
        url: 'https://github.com/noshiro-pf/mono/issues/2043',
        state: 'unknown',
      },
    ]);
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
  issues: Readonly<{
    totalCount: number;
    nodes: readonly unknown[];
  }> = NO_ISSUES,
): unknown =>
  ({
    data: {
      repository: {
        defaultBranchRef: { name: 'main' },
        ruleset: { text: RULESET },
        codeOwners: { text: '/.github/workflows/ @noshiro-pf\n' },
        open: { totalCount, nodes: openNodes },
        merged: { nodes: mergedNodes },
        issues,
      },
    },
  }) as const;

const NO_ISSUES = { totalCount: 0, nodes: [] } as const;

const openIssue = (number: number, labels: readonly string[]): unknown =>
  ({
    number,
    title: `Issue ${number}`,
    url: `https://github.com/noshiro-pf/mono/issues/${number}`,
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-23T00:00:00Z',
    author: { login: 'someone' },
    labels: {
      nodes: labels.map((labelName) => ({
        name: labelName,
        color: 'ededed',
        description: null,
      })),
    },
    comments: { totalCount: 3 },
  }) as const;

const followUpAnswer = (fields: ReadonlyRecord<string, unknown>): unknown =>
  ({
    data: { repository: fields },
  }) as const;

/** A finished suite no workflow made, which is how a codecov run reads. */
const NO_WORKFLOW_SUITE = {
  databaseId: 1,
  status: 'COMPLETED',
  workflowRun: null,
} as const;

const checkRun = (
  checkName: string,
  runStatus: string,
  conclusion: string | null,
  checkSuite: unknown = NO_WORKFLOW_SUITE,
): unknown =>
  ({
    __typename: 'CheckRun',
    databaseId: 1,
    name: checkName,
    status: runStatus,
    conclusion,
    checkSuite,
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

const COMMENT_URL = 'https://github.com/noshiro-pf/mono/pull/7#issuecomment-1';

const comment = (
  body: string,
  viewerDidAuthor: boolean,
): Readonly<{ url: string; body: string; viewerDidAuthor: boolean }> =>
  ({ url: COMMENT_URL, body, viewerDidAuthor }) as const;

/** A head a set-aside record can name, which has to be a whole SHA. */
const HEAD = 'c'.repeat(40);

/** The comment `unblock-prs` leaves on a pull request it set aside at `HEAD`. */
const setAsideComment = (
  baseSha: string,
): Readonly<{ url: string; body: string; viewerDidAuthor: boolean }> =>
  comment(
    writeSetAsideComment(
      { reason: 'rebase-failed', headSha: HEAD, baseSha },
      'Conflicts with main.',
    ),
    true,
  );

const pullRequest = ({
  number,
  contexts = PASSING,
  contextsAfter,
  files = ['libs/x/src/a.mts'],
  baseRefName = 'main',
  isCrossRepository = false,
  committedDate = '2026-09-22T00:00:00Z',
  body = '',
  bodyHTML = '',
  closingIssues = [],
  headRefOid = `sha-${number}`,
  comments = [],
}: Readonly<{
  number: number;
  contexts?: readonly unknown[];
  contextsAfter?: string;
  files?: readonly string[];
  baseRefName?: string;
  isCrossRepository?: boolean;
  committedDate?: string;
  body?: string;
  bodyHTML?: string;
  closingIssues?: readonly unknown[];
  headRefOid?: string;
  comments?: readonly unknown[];
}>): unknown =>
  ({
    number,
    title: `Pull request ${number}`,
    body,
    bodyHTML,
    isDraft: false,
    url: `https://github.com/noshiro-pf/mono/pull/${number}`,
    updatedAt: '2026-09-23T00:00:00Z',
    author: { login: 'someone' },
    autoMergeRequest: null,
    headRefName: `branch-${number}`,
    headRefOid,
    baseRefName,
    isCrossRepository,
    baseRef: { target: { oid: BASE_TIP } },
    labels: { nodes: [] },
    closingIssuesReferences: { nodes: closingIssues },
    latestOpinionatedReviews: { nodes: [] },
    files: {
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: files.map((path) => ({ path })),
    },
    commits: {
      nodes: [
        {
          commit: {
            committedDate,
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
    comments: { nodes: comments },
  }) as const;

const merged = (
  number: number,
  mergedAt: string,
  closingIssues: readonly unknown[] = [],
  bodyHTML: string = '',
): unknown =>
  ({
    number,
    title: `Merged ${number}`,
    bodyHTML,
    url: `https://github.com/noshiro-pf/mono/pull/${number}`,
    mergedAt,
    headRefName: `branch-${number}`,
    baseRefName: 'main',
    author: { login: 'someone' },
    labels: { nodes: [] },
    closingIssuesReferences: { nodes: closingIssues },
  }) as const;

/** A closing issue as GraphQL answers it, in the repository given. */
const closes = (
  number: number,
  nameWithOwner: string,
  state: string = 'CLOSED',
): unknown =>
  ({
    number,
    title: `Issue ${number}`,
    url: `https://github.com/${nameWithOwner}/issues/${number}`,
    state,
    repository: { nameWithOwner },
  }) as const;

/**
 * A paragraph of `bodyHTML` closing an issue of this repository, as GitHub
 * renders one: the keyword marked, then the reference.
 */
const keywordHtml = (keyword: string, number: number): string =>
  [
    `<p dir="auto"><span class="issue-keyword">${keyword}</span> `,
    '<a class="issue-link js-issue-link" data-error-text="Failed to load title" data-id="1" data-permission-text="Title is private"',
    ` data-url="https://github.com/noshiro-pf/mono/issues/${number}"`,
    ' data-hovercard-type="issue"',
    ` data-hovercard-url="/noshiro-pf/mono/issues/${number}/hovercard"`,
    ` href="https://github.com/noshiro-pf/mono/issues/${number}">#${number}</a>.</p>`,
  ].join('');
