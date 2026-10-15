import { writeSetAsideComment } from 'pr-report-core';
import { Arr, isRecord, Json, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { REPORT_SOURCE } from './constants.mjs';
import type { Fetch, FetchInit } from './graphql.mjs';
import {
  appendIssues,
  loadIssuePage,
  loadReport,
  type IssueList,
  type LoadedReport,
  type ReferencedItem,
} from './load-report.mjs';
import { ISSUES_LIMIT, ISSUES_PAGE_SIZE } from './report-query.mjs';

describe(loadReport, () => {
  test('reads the pull requests, then how far each head is from its base', async () => {
    const { fetchImpl, sent } = answering(
      report([pullRequest({ number: 7 })]),
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 3 } },
      }),
    );

    const loaded = await load(fetchImpl);

    const compared = named(sent, 'Compare');

    assert.strictEqual(compared.length, 1);

    assert.isTrue(compared[0]?.query.includes('compare_7: ref(') ?? false);

    // The branch name travels as a variable, never inside the query text.
    assert.strictEqual(
      compared[0]?.variables['compare_7_base'],
      'refs/heads/main',
    );

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
  });

  test('asks for every part at once, and compares once the heads are known', async () => {
    const { fetchImpl, asked, release } = holding(
      report([pullRequest({ number: 7 })]),
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
    );

    const loading = loadReport(REPORT_SOURCE, {
      token: 'token',
      nowMs: NOW_MS,
      fetchImpl,
    });

    await ticks();

    assert.deepStrictEqual(asked().toSorted(), [
      'Checks',
      'MergedPullRequests',
      'OpenIssues',
      'PullRequestDetails',
      'PullRequests',
    ]);

    await release('PullRequests');

    assert.strictEqual(asked().at(-1), 'Compare');

    await release('Checks');

    await release('PullRequestDetails');

    await release('MergedPullRequests');

    await release('OpenIssues');

    await release('Compare');

    const { result } = await loading;

    assert.isTrue(Result.isOk(result));
  });

  test('hands over the merge order before the slower parts answer', async () => {
    const mut_progress: LoadedReport[] = [];

    const { fetchImpl, release } = holding(
      report([
        pullRequest({ number: 7 }),
        pullRequest({ number: 8, baseRefName: 'branch-7' }),
      ]),
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_8: { compare: { aheadBy: 1, behindBy: 2 } },
      }),
    );

    const loading = loadReport(REPORT_SOURCE, {
      token: 'token',
      nowMs: NOW_MS,
      fetchImpl,
      onProgress: (progress) => {
        mut_progress.push(progress);
      },
    });

    await ticks();

    // Nothing to draw a merge order from yet.
    assert.deepStrictEqual(mut_progress, []);

    await release('PullRequests');

    const drawn = mut_progress.at(-1);

    assert.isDefined(drawn);

    assert.deepStrictEqual(
      drawn.roots.map(({ number, children }) => [
        number,
        children.map((child) => child.number),
      ]),
      [[7, [8]]],
    );

    assert.deepStrictEqual(drawn.entries[0]?.reading, [
      'checks',
      'comparison',
      'details',
    ]);

    assert.deepStrictEqual(drawn.summary, {
      open: 2,
      queued: 0,
      draft: 0,
      failing: undefined,
      setAside: undefined,
      awaitingReview: undefined,
    });

    assert.deepStrictEqual(drawn.reading, ['merged', 'issues']);

    await release('Checks');

    const checked = mut_progress.at(-1);

    assert.deepStrictEqual(checked?.entries[0]?.reading, [
      'comparison',
      'details',
    ]);

    assert.strictEqual(checked?.entries[0]?.checks.verdict, 'passed');

    assert.strictEqual(checked?.summary.failing, 0);

    await release('PullRequestDetails');

    await release('MergedPullRequests');

    await release('OpenIssues');

    assert.strictEqual(mut_progress.length, 5);

    await release('Compare');

    const { result } = await loading;

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(
      result.value.entries.map(({ reading }) => reading),
      [[], []],
    );

    assert.deepStrictEqual(result.value.reading, []);

    assert.deepStrictEqual(
      result.value.entries.map(({ comparison }) => comparison?.behindBy),
      [0, 2],
    );

    // The last part to answer is the read's own answer, not progress.
    assert.strictEqual(mut_progress.length, 5);
  });

  test('leaves the checks being read when they are of another head', async () => {
    const { fetchImpl } = answering(
      {
        ...report([pullRequest({ number: 7, headRefOid: 'pushed' })]),
        // A push landed between the two queries.
        ...answer('Checks', {
          open: { nodes: [pullRequest({ number: 7, headRefOid: 'before' })] },
        }),
      },
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(loaded.entries[0]?.reading, ['checks']);

    assert.isUndefined(loaded.summary.failing);
  });

  test('fails the read when a part does, after handing over what answered', async () => {
    const mut_progress: LoadedReport[] = [];

    const { fetchImpl } = answering(
      {
        ...report([pullRequest({ number: 7 })]),
        Checks: [{ data: null, errors: [{ message: 'Something went wrong' }] }],
      },
      answer('Compare', { compare_7: null }),
    );

    const { result } = await loadReport(REPORT_SOURCE, {
      token: 'token',
      nowMs: NOW_MS,
      fetchImpl,
      onProgress: (progress) => {
        mut_progress.push(progress);
      },
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'Something went wrong');

    assert.isTrue(Arr.isNonEmpty(mut_progress));
  });

  test('reads when the head was committed, beside when anything changed', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({ number: 7, committedDate: '2026-09-21T03:04:05Z' }),
      ]),
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
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
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
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
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
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
        pageInfo: { hasNextPage: true, endCursor: 'cursor-2' },
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
        startAfter: [],
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
        startAfter: [],
      },
    ]);

    assert.strictEqual(loaded.issues.endCursor, 'cursor-2');
  });

  test('lists more open issues when asked for more, a page at a time', async () => {
    const { fetchImpl, sent } = answering(
      report([], [], 0, issuePage(250, [1, 2], 'cursor-2')),
      issuesAnswer(issuePage(250, [3, 4], 'cursor-4')),
      issuesAnswer(issuePage(250, [5], 'cursor-5')),
    );

    const loaded = await load(fetchImpl, ISSUES_LIMIT + ISSUES_PAGE_SIZE + 1);

    assert.deepStrictEqual(
      named(sent, 'OpenIssues').map(({ variables }) => variables),
      [
        {
          owner: 'noshiro-pf',
          name: 'mono',
          first: ISSUES_LIMIT,
          after: null,
        },
        {
          owner: 'noshiro-pf',
          name: 'mono',
          first: ISSUES_PAGE_SIZE,
          after: 'cursor-2',
        },
        {
          owner: 'noshiro-pf',
          name: 'mono',
          first: 1,
          after: 'cursor-4',
        },
      ],
    );

    assert.deepStrictEqual(
      loaded.issues.items.map(({ number }) => number),
      [1, 2, 3, 4, 5],
    );

    assert.deepStrictEqual(loaded.issues.totalCount, 250);

    assert.strictEqual(loaded.issues.endCursor, 'cursor-5');
  });

  test('stops at the last open issue, however many were asked for', async () => {
    const { fetchImpl, sent } = answering(
      report([], [], 0, issuePage(3, [1, 2], 'cursor-2')),
      issuesAnswer(issuePage(3, [3], undefined)),
    );

    const loaded = await load(fetchImpl, 500);

    assert.strictEqual(named(sent, 'OpenIssues').length, 2);

    assert.deepStrictEqual(
      loaded.issues.items.map(({ number }) => number),
      [1, 2, 3],
    );

    assert.isUndefined(loaded.issues.endCursor);
  });

  test('asks for no more open issues than a read lists by default', async () => {
    const { fetchImpl, sent } = answering(
      report([], [], 0, issuePage(250, [1, 2], 'cursor-2')),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(named(sent, 'OpenIssues').length, 1);

    assert.strictEqual(loaded.issues.endCursor, 'cursor-2');
  });

  test('fails the read when a page of open issues cannot be read', async () => {
    const { fetchImpl } = answering(
      report([], [], 0, issuePage(250, [1, 2], 'cursor-2')),
      {
        OpenIssues: [{ data: { repository: { issues: { totalCount: 250 } } } }],
      },
    );

    const { result } = await loadReport(REPORT_SOURCE, {
      token: 'token',
      nowMs: NOW_MS,
      issueCount: 100,
      fetchImpl,
    });

    assert.isTrue(Result.isErr(result));
  });

  test('reads Start-After out of the issue bodies, and asks once for what they name that is not listed', async () => {
    const { fetchImpl, sent } = answering(
      report([], [], 0, {
        ...NO_ISSUES,
        totalCount: 3,
        nodes: [
          openIssue(2225, [], 'Moves the hosting.\n\nStart-After: #2162\n'),
          openIssue(2162, []),
          openIssue(2224, [], 'Start-After: #2139, #7, #9999\n'),
        ],
      }),
      {
        References: [
          {
            data: {
              repository: {
                ref_7: {
                  __typename: 'PullRequest',
                  number: 7,
                  title: 'Pull request 7',
                  url: 'https://github.com/noshiro-pf/mono/pull/7',
                  state: 'OPEN',
                  merged: false,
                },
                ref_2139: {
                  __typename: 'Issue',
                  number: 2139,
                  title: 'Issue 2139',
                  url: 'https://github.com/noshiro-pf/mono/issues/2139',
                  state: 'CLOSED',
                  stateReason: 'NOT_PLANNED',
                },
                ref_9999: null,
              },
            },
            errors: [
              {
                message:
                  'Could not resolve to an issue or pull request with the number of 9999.',
                path: ['repository', 'ref_9999'],
              },
            ],
          },
        ],
      },
    );

    const loaded = await load(fetchImpl);

    // The listed issue was read already.
    assert.deepStrictEqual(
      named(sent, 'References').map(({ variables }) => variables),
      [
        {
          owner: 'noshiro-pf',
          name: 'mono',
          ref_7: 7,
          ref_2139: 2139,
          ref_9999: 9999,
        },
      ],
    );

    assert.deepStrictEqual(
      loaded.issues.items.map(({ number, startAfter }) => [number, startAfter]),
      [
        [2225, [2162]],
        [2162, []],
        [2224, [2139, 7, 9999]],
      ],
    );

    // What GitHub would not describe is left out, and drawn as unknown.
    assert.deepStrictEqual(loaded.issues.referenced, [
      {
        number: 7,
        kind: 'pull-request',
        title: 'Pull request 7',
        url: 'https://github.com/noshiro-pf/mono/pull/7',
        status: 'waiting',
      },
      {
        number: 2139,
        kind: 'issue',
        title: 'Issue 2139',
        url: 'https://github.com/noshiro-pf/mono/issues/2139',
        status: 'abandoned',
      },
    ]);
  });

  test('reads a merged pull request a declaration names', async () => {
    const { fetchImpl } = answering(
      report([], [], 0, {
        ...NO_ISSUES,
        totalCount: 1,
        nodes: [openIssue(2214, [], 'Start-After: #2207')],
      }),
      answer('References', {
        ref_2207: {
          __typename: 'PullRequest',
          number: 2207,
          title: 'Pull request 2207',
          url: 'https://github.com/noshiro-pf/mono/pull/2207',
          state: 'MERGED',
          merged: true,
        },
      }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(loaded.issues.referenced, [
      {
        number: 2207,
        kind: 'pull-request',
        title: 'Pull request 2207',
        url: 'https://github.com/noshiro-pf/mono/pull/2207',
        status: 'done',
      },
    ]);
  });

  test('asks nothing more when every declaration names a listed issue', async () => {
    const { fetchImpl, sent } = answering(
      report([], [], 0, {
        ...NO_ISSUES,
        totalCount: 2,
        nodes: [openIssue(2, [], 'Start-After: #1'), openIssue(1, [])],
      }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(named(sent, 'References'), []);

    assert.deepStrictEqual(loaded.issues.referenced, []);
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
      answer('Compare', { compare_7: null, compare_8: null }),
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
      answer('Compare', { compare_7: null }),
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
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
      answer('MoreChecks', {
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

    assert.strictEqual(
      named(sent, 'MoreChecks')[0]?.variables['contexts_7_after'],
      'cursor-1',
    );

    assert.deepStrictEqual(loaded.entries[0]?.checks.pending, [
      'no-skip-ci-label',
    ]);
  });

  test('reports a wait for a code owner', async () => {
    const { fetchImpl } = answering(
      report([
        pullRequest({ number: 7, files: ['.github/workflows/release.yml'] }),
      ]),
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
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
      answer('Compare', {
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
      answer('Compare', {
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
      answer('Compare', {
        compare_7: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_8: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_9: { compare: { aheadBy: 1, behindBy: 0 } },
        compare_10: { compare: { aheadBy: 1, behindBy: 0 } },
      }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(
      named(sent, 'Compare')[0]?.variables['compare_8_base'],
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
      answer('Compare', { compare_1962: null }),
      answer('Issues', { issue_2043: closes(2043, 'noshiro-pf/mono', 'OPEN') }),
    );

    const loaded = await load(fetchImpl);

    const described = named(sent, 'Issues');

    assert.strictEqual(described.length, 1);

    assert.isTrue(described[0]?.query.includes('issue_2043: issue(') ?? false);

    assert.strictEqual(described[0]?.variables['issue_2043'], 2043);

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
      answer('Compare', { compare_2126: null }),
    );

    const loaded = await load(fetchImpl);

    assert.deepStrictEqual(named(sent, 'Issues'), []);

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
      answer('Issues', { issue_1995: closes(1995, 'noshiro-pf/mono') }),
    );

    const loaded = await load(fetchImpl);

    assert.strictEqual(named(sent, 'Issues').length, 1);

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
      answer('Compare', { compare_1962: null }),
      {
        Issues: [
          {
            data: { repository: { issue_2043: null } },
            errors: [
              {
                message:
                  'Could not resolve to an Issue with the number of 2043.',
                path: ['repository', 'issue_2043'],
              },
            ],
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
    const mut_remaining = [4990, 4988, 4989, 4987];

    const { fetchImpl, sent } = answering(report([]), {}, () => ({
      'x-ratelimit-remaining': String(mut_remaining.shift() ?? 4999),
      'x-ratelimit-limit': '5000',
      'x-ratelimit-reset': '1790000000',
    }));

    const { rateLimit } = await loadReport(REPORT_SOURCE, {
      token: 'secret',
      nowMs: NOW_MS,
      fetchImpl,
    });

    assert.isTrue(
      sent.every(({ headers }) => headers['Authorization'] === 'Bearer secret'),
    );

    // The parts answer in no particular order; the least left is the latest.
    assert.deepStrictEqual(rateLimit, {
      remaining: 4987,
      limit: 5000,
      resetEpochMs: 1_790_000_000_000,
    });
  });
});

describe(loadIssuePage, () => {
  test('reads the open issues after a cursor', async () => {
    const { fetchImpl, sent } = answering(
      issuesAnswer(issuePage(250, [31, 32], 'cursor-32')),
    );

    const { result } = await loadIssuePage(REPORT_SOURCE, {
      token: 'token',
      after: 'cursor-30',
      first: 100,
      fetchImpl,
    });

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(sent[0]?.variables, {
      owner: 'noshiro-pf',
      name: 'mono',
      first: 100,
      after: 'cursor-30',
    });

    assert.deepStrictEqual(
      result.value.items.map(({ number }) => number),
      [31, 32],
    );

    assert.strictEqual(result.value.totalCount, 250);

    assert.strictEqual(result.value.endCursor, 'cursor-32');
  });

  test('says so when the answer is not a page of issues', async () => {
    const { fetchImpl } = answering({
      OpenIssues: [{ data: { repository: {} } }],
    });

    const { result } = await loadIssuePage(REPORT_SOURCE, {
      token: 'token',
      after: 'cursor-30',
      first: 100,
      fetchImpl,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'not the shape this page expects');
  });
});

describe(appendIssues, () => {
  test('keeps what either read described, the page winning', () => {
    const appended = appendIssues(
      {
        ...issueList([1], 10, 'cursor-1'),
        referenced: [referenced(5, 'waiting'), referenced(8, 'done')],
      },
      {
        ...issueList([2], 10, 'cursor-2'),
        referenced: [referenced(3, 'done'), referenced(5, 'done')],
      },
    );

    assert.deepStrictEqual(
      appended.referenced.map((item) => [item.number, item.status]),
      [
        [3, 'done'],
        [5, 'done'],
        [8, 'done'],
      ],
    );
  });

  test('puts the page after the list, and takes its count and cursor', () => {
    const appended = appendIssues(
      issueList([1, 2], 10, 'cursor-2'),
      issueList([2, 3], 9, 'cursor-3'),
    );

    // #2 was updated between the reads and met in both.
    assert.deepStrictEqual(
      appended.items.map(({ number }) => number),
      [1, 2, 3],
    );

    assert.strictEqual(appended.totalCount, 9);

    assert.strictEqual(appended.endCursor, 'cursor-3');
  });
});

const issueList = (
  numbers: readonly number[],
  totalCount: number,
  endCursor: string | undefined,
): IssueList =>
  ({
    items: numbers.map((number) => ({
      number,
      title: `Issue ${number}`,
      author: 'someone',
      url: `https://github.com/noshiro-pf/mono/issues/${number}`,
      labels: [],
      createdAt: '2026-09-20T00:00:00Z',
      updatedAt: '2026-09-23T00:00:00Z',
      comments: 0,
      startAfter: [],
    })),
    totalCount,
    endCursor,
    referenced: [],
  }) as const;

const referenced = (
  number: number,
  itemStatus: ReferencedItem['status'],
): ReferencedItem =>
  ({
    number,
    kind: 'issue',
    title: `Issue ${number}`,
    url: `https://github.com/noshiro-pf/mono/issues/${number}`,
    status: itemStatus,
  }) as const;

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

const load = async (
  fetchImpl: Fetch,
  issueCount?: number,
): Promise<LoadedReport> => {
  const { result } = await loadReport(REPORT_SOURCE, {
    token: 'token',
    nowMs: NOW_MS,
    ...(issueCount === undefined ? {} : { issueCount }),
    fetchImpl,
  });

  assert.isTrue(Result.isOk(result));

  return result.value;
};

/** What to answer each query with, by its operation name, in turn. */
type Answers = ReadonlyRecord<string, readonly unknown[]>;

type Sent = Readonly<{
  /** The operation name, `PullRequests` for `query PullRequests(…`. */
  operation: string;
  query: string;
  variables: ReadonlyRecord<string, unknown>;
  headers: FetchInit['headers'];
}>;

/**
 * A `fetch` that answers each query with the next answer `parts` give for
 * its name — `{}` once they run out — and keeps what it was asked. By name
 * rather than by order, because the parts of a read go out together and
 * answer in whatever order they finish.
 */
const answering = (
  ...parts: readonly (Answers | (() => ReadonlyRecord<string, string>))[]
): Readonly<{ fetchImpl: Fetch; sent: readonly Sent[] }> => {
  const mut_sent: Sent[] = [];

  const answers = parts.filter((part) => typeof part !== 'function');

  const headersOf = parts.find((part) => typeof part === 'function');

  const fetchImpl: Fetch = (_, init) => {
    const sent = sentOf(init);

    const answered = named(mut_sent, sent.operation).length;

    mut_sent.push(sent);

    const body =
      answers.flatMap((part) => part[sent.operation] ?? [])[answered] ?? {};

    return Promise.resolve(
      Response.json(body, {
        ...(headersOf === undefined ? {} : { headers: headersOf() }),
      }),
    );
  };

  return { fetchImpl, sent: mut_sent };
};

const sentOf = (init: FetchInit): Sent => {
  const parsed = Json.parse(init.body);

  const request = Result.isOk(parsed) ? parsed.value : undefined;

  const variables = isRecord(request) ? request['variables'] : undefined;

  const query =
    isRecord(request) && typeof request['query'] === 'string'
      ? request['query']
      : '';

  return {
    operation: /^query (\w+)/u.exec(query)?.[1] ?? '',
    query,
    variables: isRecord(variables) ? variables : {},
    headers: init.headers,
  };
};

/**
 * {@link answering}, but each answer is held back until `release` is called
 * with its query's name, so that a test can say which part answers first.
 */
const holding = (
  ...parts: readonly Answers[]
): Readonly<{
  fetchImpl: Fetch;
  /** The names of the queries sent so far, in the order they were sent. */
  asked: () => readonly string[];
  /** Answers every query sent so far as `operation`, and lets them land. */
  release: (operation: string) => Promise<void>;
}> => {
  const { fetchImpl: answerNow } = answering(...parts);

  const mut_held: Readonly<{ operation: string; release: () => void }>[] = [];

  const fetchImpl: Fetch = async (route, init) =>
    new Promise((resolve) => {
      mut_held.push({
        operation: sentOf(init).operation,
        release: () => {
          resolve(answerNow(route, init));
        },
      });
    });

  return {
    fetchImpl,
    asked: () => mut_held.map(({ operation }) => operation),
    release: async (operation) => {
      for (const held of mut_held) {
        if (held.operation === operation) {
          // Resolving a promise twice is no more than resolving it once.
          held.release();
        }
      }

      await ticks();
    },
  };
};

/** Lets every answer already given land, and what follows from it run. */
const ticks = async (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

/** What was sent as `operation`, in the order it was sent. */
const named = (sent: readonly Sent[], operation: string): readonly Sent[] =>
  sent.filter((each) => each.operation === operation);

/** One answer to the query `operation`, its fields under `repository`. */
const answer = (
  operation: string,
  fields: ReadonlyRecord<string, unknown>,
): Answers => ({ [operation]: [{ data: { repository: fields } }] }) as const;

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

/**
 * Every query a read sends but the follow-ups, answered from one set of
 * pull requests: each of the three that list them is handed the whole node
 * and reads the fields it asks for.
 */
const report = (
  openNodes: readonly unknown[],
  mergedNodes: readonly unknown[] = [],
  totalCount: number = openNodes.length,
  issues: unknown = NO_ISSUES,
): Answers =>
  ({
    ...answer('PullRequests', {
      defaultBranchRef: { name: 'main' },
      ruleset: { text: RULESET },
      codeOwners: { text: '/.github/workflows/ @noshiro-pf\n' },
      open: { totalCount, nodes: openNodes },
    }),
    ...answer('Checks', { open: { nodes: openNodes } }),
    ...answer('PullRequestDetails', { open: { nodes: openNodes } }),
    ...answer('MergedPullRequests', { merged: { nodes: mergedNodes } }),
    ...issuesAnswer(issues),
  }) as const;

const NO_ISSUES = {
  totalCount: 0,
  pageInfo: { hasNextPage: false, endCursor: null },
  nodes: [],
} as const;

/** A page of open issues, the last one when `endCursor` is `undefined`. */
const issuePage = (
  totalCount: number,
  numbers: readonly number[],
  endCursor: string | undefined,
): unknown =>
  ({
    totalCount,
    pageInfo: {
      hasNextPage: endCursor !== undefined,
      endCursor: endCursor ?? null,
    },
    nodes: numbers.map((number) => openIssue(number, [])),
  }) as const;

const issuesAnswer = (page: unknown): Answers =>
  answer('OpenIssues', { issues: page });

const openIssue = (
  number: number,
  labels: readonly string[],
  body: string = '',
): unknown =>
  ({
    number,
    title: `Issue ${number}`,
    body,
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
