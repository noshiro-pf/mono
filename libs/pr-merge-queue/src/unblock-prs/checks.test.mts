// cspell:ignore unstub
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { parseJson, type ApiContext } from '../lib/index.mjs';
import {
  describeWaitingOn,
  headChecksOf,
  readHeadChecks,
  reportedChecksOf,
  summarizeChecks,
  type CheckContextNode,
  type ReportedCheck,
  type RunningCheck,
} from './checks.mjs';

describe(summarizeChecks, () => {
  const required = ['code-check-result / result', 'no-skip-ci-label'] as const;

  test('passes when every required context passed and nothing is running', () => {
    const summary = summarizeChecks(
      [check('code-check-result / result'), check('no-skip-ci-label')],
      required,
      [],
    );

    assert.strictEqual(summary.verdict, 'passed');
  });

  test('counts a skipped context as met, as GitHub does', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'skipping'),
        check('no-skip-ci-label'),
      ],
      required,
      [],
    );

    assert.strictEqual(summary.verdict, 'passed');
  });

  // #2069: `skip-ci` came off a head whose previous round had concluded the
  // aggregates `skipped`, and the new round had not created them yet.
  test('stays pending while any check on the head is still running', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'skipping'),
        check('no-skip-ci-label'),
      ],
      required,
      [running('code-check (ws:fix:lint)')],
    );

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.running, ['code-check (ws:fix:lint)']);

    assert.strictEqual(
      describeWaitingOn(summary),
      'code-check (ws:fix:lint) (running)',
    );
  });

  test('does not list a required check as running twice', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'pending'),
        check('no-skip-ci-label'),
      ],
      required,
      [
        running('code-check-result / result'),
        running('code-check (ws:fix:lint)'),
      ],
    );

    assert.deepStrictEqual(summary.pending, ['code-check-result / result']);

    assert.deepStrictEqual(summary.running, ['code-check (ws:fix:lint)']);
  });

  test('fails on a failed required check even while others run', () => {
    const summary = summarizeChecks(
      [check('code-check-result / result', 'fail'), check('no-skip-ci-label')],
      required,
      [running('code-check (ws:fix:lint)')],
    );

    assert.strictEqual(summary.verdict, 'failing');
  });

  test('fails on a required check that failed in the round still running', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'fail', {
          completedAt: '2026-10-12T15:20:45Z',
        }),
        check('no-skip-ci-label'),
      ],
      required,
      [running('code-check (ws:fix:lint)', '2026-10-12T15:20:14Z')],
    );

    assert.strictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);

    assert.deepStrictEqual(summary.failedRuns, [
      {
        name: 'code-check-result / result',
        link: 'https://example.com/code-check-result / result',
      },
    ]);
  });

  // #2246: the round `skip-ci` cancelled when the pull request was opened
  // left the aggregates red, and `skip-ci` came off the same head.
  test('waits on a required check that failed before the round still running began', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'cancel', {
          completedAt: '2026-10-12T12:13:37Z',
        }),
        check('no-skip-ci-label'),
      ],
      required,
      [running('code-check (ws:fix:lint)', '2026-10-12T15:20:14Z')],
    );

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failed, []);

    assert.deepStrictEqual(summary.failedRuns, []);

    assert.deepStrictEqual(summary.pending, ['code-check-result / result']);
  });

  // #2463: `skip-ci` came off while the round it was put on for was still
  // being cancelled, so that round's aggregate went red 22 seconds after the
  // new round's first check started. Its workflow's own new run, queued behind
  // it by the concurrency group, is what says it is the round before.
  test('waits on a required check whose workflow has a newer run still running', () => {
    const summary = summarizeChecks(
      [
        check('synstate-benchmark-result / result', 'fail', {
          completedAt: '2026-10-25T18:12:55Z',
          workflow: 'SynState Benchmark',
          runId: 40220095906,
        }),
        check('no-skip-ci-label'),
      ],
      ['synstate-benchmark-result / result', 'no-skip-ci-label'],
      [
        running('code-check (ws:fix:lint)', '2026-10-25T18:12:33Z', {
          workflow: 'Code Check',
          runId: 40220140988,
        }),
        running('gates / check', '2026-10-25T18:12:57Z', {
          workflow: 'SynState Benchmark',
          runId: 40220140914,
        }),
      ],
    );

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failed, []);

    assert.deepStrictEqual(summary.failedRuns, []);
  });

  // #2772: a check run still queued has no start time, and a placeholder for
  // it read as year 1 put the round's start before every red.
  test('waits on a required check that failed before the round began while a running check is still queued', () => {
    const { running: stillRunning } = headChecksOf([
      checkRun('code-check (ws:fix:lint)', 'IN_PROGRESS', null),
      checkRun('code-check (ws:check:types)', 'QUEUED', null, null),
    ]);

    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'cancel', {
          completedAt: '2026-10-25T09:00:00Z',
        }),
        check('no-skip-ci-label'),
      ],
      required,
      stillRunning,
    );

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failedRuns, []);

    assert.deepStrictEqual(summary.pending, ['code-check-result / result']);
  });

  test('fails on a required check whose workflow is still running in the same run', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'fail', {
          completedAt: '2026-10-25T18:12:55Z',
          workflow: 'Code Check',
          runId: 200,
        }),
        check('no-skip-ci-label'),
      ],
      required,
      [
        running('code-check (ws:fix:lint)', '2026-10-25T18:12:33Z', {
          workflow: 'Code Check',
          runId: 200,
        }),
      ],
    );

    assert.strictEqual(summary.verdict, 'failing');
  });

  test('fails on a required check when only another workflow has a newer run', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'fail', {
          completedAt: '2026-10-25T18:12:55Z',
          workflow: 'Code Check',
          runId: 100,
        }),
        check('no-skip-ci-label'),
      ],
      required,
      [
        running('gates / check', '2026-10-25T18:12:33Z', {
          workflow: 'SynState Benchmark',
          runId: 200,
        }),
      ],
    );

    assert.strictEqual(summary.verdict, 'failing');
  });

  test('fails on a red left by the round before once nothing runs', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'fail', {
          completedAt: '2026-10-12T12:13:37Z',
        }),
        check('no-skip-ci-label'),
      ],
      required,
      [],
    );

    assert.strictEqual(summary.verdict, 'failing');
  });

  test('stays pending while a required context has not reported', () => {
    const summary = summarizeChecks([check('no-skip-ci-label')], required, []);

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.missing, ['code-check-result / result']);
  });

  test('counts the contexts the verdict was reached over', () => {
    const summary = summarizeChecks(
      [check('code-check-result / result'), check('no-skip-ci-label')],
      required,
      [],
    );

    assert.strictEqual(summary.required, 2);
  });

  // The rules could not be read: what `--required` reported is all there is.
  test('judges by what has reported when nothing is known to be required', () => {
    assert.strictEqual(
      summarizeChecks([check('no-skip-ci-label')], [], []).verdict,
      'passed',
    );

    assert.strictEqual(
      summarizeChecks([check('no-skip-ci-label', 'fail')], [], []).verdict,
      'failing',
    );
  });

  test('stays pending while nothing has reported, even with nothing known to be required', () => {
    assert.strictEqual(summarizeChecks([], [], []).verdict, 'pending');
  });

  test('fails on a context that failed once and passed once, as GitHub does', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result'),
        check('code-check-result / result', 'fail'),
        check('no-skip-ci-label'),
      ],
      required,
      [],
    );

    assert.strictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);
  });

  // The worker arms a pull request it judges green, and an armed pull request
  // stacked on a branch no ruleset covers merges into it at once.
  // So a required context that has not reported is waited for wherever the pull
  // request points, unlike in `pr-report`'s `notRun`.
  test('waits on a required context that has not reported, whatever the base', () => {
    const summary = summarizeChecks([check('no-skip-ci-label')], required, []);

    assert.deepStrictEqual(summary.notRun, []);

    assert.deepStrictEqual(summary.missing, ['code-check-result / result']);
  });

  test("never reads as paused: `skip-ci` is the queue's to read, not the checks'", () => {
    assert.notStrictEqual(
      summarizeChecks([check('no-skip-ci-label', 'pending')], required, [])
        .verdict,
      'paused',
    );
  });
});

/** What `gh` reports for a job of a workflow run, or a status's own URL. */
const linkOf = (name: string, runId: number | undefined): string =>
  runId === undefined
    ? (`https://example.com/${name}` as const)
    : (`https://github.com/noshiro-pf/mono/actions/runs/${runId}/job/1` as const);

const check = (
  name: string,
  bucket: string = 'pass',
  {
    completedAt,
    workflow = '',
    runId,
  }: Readonly<{
    /** When it finished, which is also taken as when it started. */
    completedAt?: string;
    workflow?: string;
    runId?: number;
  }> = {},
): ReportedCheck =>
  ({
    name,
    bucket,
    link: linkOf(name, runId),
    startedAt: completedAt,
    completedAt,
    workflow,
  }) as const;

const running = (
  name: string,
  startedAt?: string,
  {
    workflow = '',
    runId,
  }: Readonly<{ workflow?: string; runId?: number }> = {},
): RunningCheck =>
  ({ name, startedAt, workflow, link: linkOf(name, runId) }) as const;

describe(reportedChecksOf, () => {
  test('sorts a check run into the bucket `gh pr checks` would', () => {
    const buckets = reportedChecksOf(
      [
        checkRun('a', 'COMPLETED', 'SUCCESS'),
        checkRun('b', 'COMPLETED', 'SKIPPED'),
        checkRun('c', 'COMPLETED', 'NEUTRAL'),
        checkRun('d', 'COMPLETED', 'FAILURE'),
        checkRun('e', 'COMPLETED', 'TIMED_OUT'),
        checkRun('f', 'COMPLETED', 'ACTION_REQUIRED'),
        checkRun('g', 'COMPLETED', 'CANCELLED'),
        checkRun('h', 'IN_PROGRESS', null),
        checkRun('i', 'QUEUED', null, null),
        checkRun('j', 'COMPLETED', 'STALE'),
        checkRun('k', 'COMPLETED', 'STARTUP_FAILURE'),
      ],
      'all',
    ).map(({ name, bucket }) => `${name}:${bucket}`);

    assert.deepStrictEqual(buckets, [
      'a:pass',
      'b:skipping',
      'c:skipping',
      'd:fail',
      'e:fail',
      'f:fail',
      'g:cancel',
      'h:pending',
      'i:pending',
      'j:pending',
      'k:fail',
    ]);
  });

  test('sorts a commit status by its state, its time being when it was set', () => {
    assert.deepStrictEqual(
      reportedChecksOf(
        [
          statusContext('no-skip-ci-label', 'SUCCESS'),
          statusContext('x', 'FAILURE'),
          statusContext('y', 'ERROR'),
          statusContext('z', 'PENDING'),
          statusContext('w', 'EXPECTED'),
        ],
        'all',
      ).map(({ name, bucket, link, startedAt, completedAt }) => ({
        name,
        bucket,
        link,
        startedAt,
        completedAt,
      })),
      (
        [
          ['no-skip-ci-label', 'pass'],
          ['x', 'fail'],
          ['y', 'fail'],
          ['z', 'pending'],
          ['w', 'pending'],
        ] as const
      ).map(([name, bucket]) => ({
        name,
        bucket,
        link: '',
        startedAt: '2026-10-25T10:00:00Z',
        completedAt: '2026-10-25T10:00:00Z',
      })),
    );
  });

  // #2772: a placeholder time parsed as a real one, in year 1.
  test('leaves a time not reached yet undefined', () => {
    const [queued] = reportedChecksOf(
      [checkRun('i', 'QUEUED', null, null)],
      'all',
    );

    assert.isDefined(queued);

    assert.isUndefined(queued.startedAt);

    assert.isUndefined(queued.completedAt);
  });

  test('keeps only the latest run of a job in one workflow and event', () => {
    const checks = reportedChecksOf(
      [
        checkRun('a', 'COMPLETED', 'CANCELLED', '2026-10-25T09:00:00Z'),
        checkRun('a', 'IN_PROGRESS', null, '2026-10-25T11:00:00Z'),
        checkRun('a', 'COMPLETED', 'SUCCESS', '2026-10-25T08:00:00Z', {
          event: 'push',
        }),
      ],
      'all',
    );

    assert.deepStrictEqual(
      checks.map(({ bucket }) => bucket),
      ['pending', 'pass'],
    );
  });

  test('reads the workflow of a check run, and none for a commit status', () => {
    assert.deepStrictEqual(
      reportedChecksOf(
        [checkRun('a', 'COMPLETED', 'SUCCESS'), statusContext('b', 'SUCCESS')],
        'all',
      ).map(({ workflow }) => workflow),
      ['code-check', ''],
    );
  });

  test('keeps a check run and a commit status of the same name apart', () => {
    assert.strictEqual(
      reportedChecksOf(
        [checkRun('x', 'COMPLETED', 'SUCCESS'), statusContext('x', 'FAILURE')],
        'all',
      ).length,
      2,
    );
  });

  test('leaves out what the branch does not require when asked to', () => {
    assert.deepStrictEqual(
      reportedChecksOf(
        [
          checkRun('a', 'COMPLETED', 'SUCCESS'),
          checkRun('b', 'COMPLETED', 'SUCCESS', undefined, {
            isRequired: false,
          }),
        ],
        'required',
      ).map(({ name }) => name),
      ['a'],
    );
  });
});

describe(headChecksOf, () => {
  test('takes the required checks and the running ones from one read', () => {
    const checks = headChecksOf([
      checkRun('a', 'COMPLETED', 'SUCCESS'),
      checkRun('b', 'IN_PROGRESS', null, '2026-10-25T11:00:00Z', {
        isRequired: false,
      }),
      checkRun('c', 'QUEUED', null, null),
    ]);

    assert.deepStrictEqual(
      checks.required.map(({ name, bucket }) => `${name}:${bucket}`),
      ['a:pass', 'c:pending'],
    );

    assert.deepStrictEqual(checks.running, [
      {
        name: 'b',
        startedAt: '2026-10-25T11:00:00Z',
        workflow: 'code-check',
        link: 'https://example.com/b',
      },
      {
        name: 'c',
        startedAt: undefined,
        workflow: 'code-check',
        link: 'https://example.com/c',
      },
    ]);
  });
});

describe(readHeadChecks, () => {
  const api: ApiContext = {
    repo: { owner: 'noshiro-pf', name: 'mono' },
    token: 'token',
  } as const;

  // #2786: the required list and the running list were each read on their
  // own, twice the requests and from two moments.
  test('sends one request for a head whose checks fit on a page', async () => {
    const sent = stubRollupPages([
      [
        checkRun('a', 'COMPLETED', 'SUCCESS'),
        checkRun('b', 'IN_PROGRESS', null),
      ],
    ]);

    try {
      const checks = Result.unwrapThrow(await readHeadChecks(api, 1));

      assert.lengthOf(sent, 1);

      assert.deepStrictEqual(
        checks.required.map(({ name }) => name),
        ['a', 'b'],
      );

      assert.deepStrictEqual(
        checks.running.map(({ name }) => name),
        ['b'],
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('reads each page once and takes both lists from all of them', async () => {
    const sent = stubRollupPages([
      [checkRun('a', 'COMPLETED', 'SUCCESS')],
      [checkRun('b', 'IN_PROGRESS', null)],
    ]);

    try {
      const checks = Result.unwrapThrow(await readHeadChecks(api, 1));

      assert.deepStrictEqual(sent, [undefined, 'cursor-1']);

      assert.deepStrictEqual(
        checks.required.map(({ name }) => name),
        ['a', 'b'],
      );

      assert.deepStrictEqual(
        checks.running.map(({ name }) => name),
        ['b'],
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

/**
 * Stubs `fetch` to answer the rollup query with `pages` in turn, each but the
 * last pointing at the next by the cursor `cursor-<n>`, and returns the `after`
 * each request asked from, as it is sent.
 */
const stubRollupPages = (
  pages: readonly (readonly CheckContextNode[])[],
): readonly (string | undefined)[] => {
  const mut_sent: (string | undefined)[] = [];

  vi.stubGlobal(
    'fetch',
    (_url: string, init?: Readonly<{ body?: unknown }>): Promise<Response> => {
      const { variables } = Result.unwrapThrow(
        parseJson(
          typeof init?.body === 'string' ? init.body : '',
          t.record({
            variables: t.record({ after: t.optional(t.string()) }),
          }),
          'request',
        ),
      );

      const index = mut_sent.length;

      mut_sent.push(variables.after);

      const hasNextPage = index + 1 < pages.length;

      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              repository: {
                pullRequest: {
                  commits: {
                    nodes: [
                      {
                        commit: {
                          statusCheckRollup: {
                            contexts: {
                              pageInfo: {
                                hasNextPage,
                                endCursor: hasNextPage
                                  ? `cursor-${index + 1}`
                                  : null,
                              },
                              nodes: pages[index] ?? [],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          }),
          { status: 200 },
        ),
      );
    },
  );

  return mut_sent;
};

const checkRun = (
  name: string,
  status: string,
  conclusion: string | null,
  startedAt: string | null = '2026-10-25T10:00:00Z',
  { isRequired = true, event = 'pull_request' }: CheckRunOptions = {},
): CheckContextNode =>
  ({
    __typename: 'CheckRun',
    name,
    status,
    conclusion,
    startedAt,
    completedAt: conclusion === null ? null : ('2026-10-25T10:05:00Z' as const),
    detailsUrl: `https://example.com/${name}`,
    isRequired,
    checkSuite: {
      workflowRun: { event, workflow: { name: 'code-check' } },
    },
  }) as const;

type CheckRunOptions = Readonly<{ isRequired?: boolean; event?: string }>;

const statusContext = (
  context: string,
  state: string,
  createdAt = '2026-10-25T10:00:00Z',
): CheckContextNode =>
  ({
    __typename: 'StatusContext',
    context,
    state,
    targetUrl: null,
    createdAt,
    isRequired: true,
  }) as const;
