// cspell:ignore unstub
import { RE_RUN_GRACE_MS, type WorkflowRound } from 'pr-report-core';
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
    reRunAfter: false,
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
        checkRun('a', 'COMPLETED', 'CANCELLED', '2026-10-25T09:00:00Z', {
          checkSuiteId: 1,
          id: 10,
        }),
        checkRun('a', 'IN_PROGRESS', null, '2026-10-25T11:00:00Z', {
          checkSuiteId: 2,
          id: 20,
        }),
        checkRun('a', 'COMPLETED', 'SUCCESS', '2026-10-25T08:00:00Z', {
          event: 'push',
          checkSuiteId: 3,
          id: 30,
        }),
      ],
      'all',
    );

    assert.deepStrictEqual(
      checks.map(({ bucket }) => bucket),
      ['pending', 'pass'],
    );
  });

  // #3334: a run not started yet has no start time, and ranking by it put a
  // queued re-run behind the attempt it re-runs.
  test('keeps a queued re-run of a job over the attempt that failed', () => {
    const checks = reportedChecksOf(
      [
        checkRun('a', 'COMPLETED', 'FAILURE', '2026-10-25T09:00:00Z', {
          checkSuiteId: 1,
          id: 10,
        }),
        checkRun('a', 'QUEUED', null, null, { checkSuiteId: 1, id: 11 }),
      ],
      'all',
    );

    assert.deepStrictEqual(
      checks.map(({ bucket }) => bucket),
      ['pending'],
    );
  });

  test('keeps a queued run of a newer round over the red of the round before', () => {
    const checks = reportedChecksOf(
      [
        checkRun('a', 'QUEUED', null, null, { checkSuiteId: 2, id: 20 }),
        checkRun('a', 'COMPLETED', 'CANCELLED', '2026-10-25T09:00:00Z', {
          checkSuiteId: 1,
          id: 10,
        }),
      ],
      'all',
    );

    assert.deepStrictEqual(
      checks.map(({ bucket }) => bucket),
      ['pending'],
    );
  });

  // Whether a run cancelled while still queued reports a start time is not
  // something the ranking has to know: the newer suite wins either way.
  test('keeps the newer round over a run cancelled before it started', () => {
    const checks = reportedChecksOf(
      [
        checkRun('a', 'COMPLETED', 'CANCELLED', null, {
          checkSuiteId: 1,
          id: 10,
        }),
        checkRun('a', 'IN_PROGRESS', null, '2026-10-25T09:00:00Z', {
          checkSuiteId: 2,
          id: 20,
        }),
      ],
      'all',
    );

    assert.deepStrictEqual(
      checks.map(({ bucket }) => bucket),
      ['pending'],
    );
  });

  // GitHub answers a required context with the run in the suite of the greatest
  // id, whichever run is newer (`pr-report-core`'s `statesFromCheckRuns`).
  test('ranks runs by their check suite before their own id', () => {
    const checks = reportedChecksOf(
      [
        checkRun('a', 'COMPLETED', 'SUCCESS', '2026-10-25T09:00:00Z', {
          checkSuiteId: 1,
          id: 30,
        }),
        checkRun('a', 'COMPLETED', 'FAILURE', '2026-10-25T08:00:00Z', {
          checkSuiteId: 2,
          id: 20,
        }),
      ],
      'all',
    );

    assert.deepStrictEqual(
      checks.map(({ bucket }) => bucket),
      ['fail'],
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

describe('headChecksOf, then summarizeChecks', () => {
  const required = ['code-check-result / result', 'no-skip-ci-label'] as const;

  const summarize = (
    contexts: readonly CheckContextNode[],
    rounds: ReadonlyMap<number, WorkflowRound> = new Map<
      number,
      WorkflowRound
    >(),
  ): ReturnType<typeof summarizeChecks> => {
    const head = headChecksOf(contexts, rounds, NOW_MS);

    return summarizeChecks(head.required, required, head.running);
  };

  /** Suite 1's workflow run, re-run at 09:30, after its red of 09:00. */
  const reRunning: ReadonlyMap<number, WorkflowRound> = new Map<
    number,
    WorkflowRound
  >([
    [
      1,
      {
        workflowId: 7,
        completed: false,
        attemptStartedAt: '2026-10-25T09:30:00Z',
      },
    ],
  ]);

  // #3334: the queued re-run counted as the oldest run of its job, so the
  // attempt it re-runs spoke for it.
  test('waits on a queued re-run of a required job that failed', () => {
    const summary = summarize([
      checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', null, {
        completedAt: '2026-10-25T09:00:00Z',
        checkSuiteId: 1,
        id: 10,
        runId: 100,
      }),
      checkRun('code-check-result / result', 'QUEUED', null, null, {
        checkSuiteId: 1,
        id: 11,
        runId: 100,
      }),
      statusContext('no-skip-ci-label', 'SUCCESS'),
    ]);

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failedRuns, []);
  });

  // #3334: "Re-run failed jobs" queues the failed matrix job again, and the
  // aggregate's own re-run is created only once that job is done, so until then
  // the aggregate's red from the attempt before is all its context has.
  test('waits on a red aggregate while a re-run of a job it needs is queued', () => {
    const summary = summarize(
      [
        checkRun('code-check (ws:fix:lint)', 'COMPLETED', 'FAILURE', null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 10,
          runId: 100,
        }),
        checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', null, {
          completedAt: '2026-10-25T09:00:00Z',
          checkSuiteId: 1,
          id: 11,
          runId: 100,
        }),
        checkRun('code-check (ws:fix:lint)', 'QUEUED', null, null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 12,
          runId: 100,
        }),
        statusContext('no-skip-ci-label', 'SUCCESS'),
      ],
      reRunning,
    );

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failedRuns, []);
  });

  // #3474: whether the rollup lists every attempt of a job was never checked
  // against a live answer. The rule reads the workflow run instead, so it holds
  // when only the latest attempt is listed too.
  test('waits on a red aggregate under a re-run when the rollup lists only the latest attempt', () => {
    const summary = summarize(
      [
        checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', null, {
          completedAt: '2026-10-25T09:00:00Z',
          checkSuiteId: 1,
          id: 11,
          runId: 100,
        }),
        checkRun('code-check (ws:fix:lint)', 'QUEUED', null, null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 12,
          runId: 100,
        }),
        statusContext('no-skip-ci-label', 'SUCCESS'),
      ],
      reRunning,
    );

    assert.strictEqual(summary.verdict, 'pending');
  });

  // #3474: two jobs sharing a display name read as a re-run under the old rule.
  test('fails on a red aggregate beside two jobs of one name when nothing is re-run', () => {
    const summary = summarize(
      [
        checkRun('code-check (shard)', 'COMPLETED', 'SUCCESS', null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 10,
          runId: 100,
        }),
        checkRun(
          'code-check (shard)',
          'IN_PROGRESS',
          null,
          '2026-10-25T08:50:00Z',
          {
            isRequired: false,
            checkSuiteId: 1,
            id: 12,
            runId: 100,
          },
        ),
        checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', null, {
          completedAt: '2026-10-25T09:00:00Z',
          checkSuiteId: 1,
          id: 11,
          runId: 100,
        }),
        statusContext('no-skip-ci-label', 'SUCCESS'),
      ],
      new Map<number, WorkflowRound>([
        [
          1,
          {
            workflowId: 7,
            completed: false,
            attemptStartedAt: '2026-10-25T08:00:00Z',
          },
        ],
      ]),
    );

    assert.strictEqual(summary.verdict, 'failing');
  });

  // #3474: a re-run GitHub never settles holds the red back no longer than the
  // grace period.
  test('fails on a red aggregate once its re-run has gone on past the grace period', () => {
    const red = checkRun(
      'code-check-result / result',
      'COMPLETED',
      'FAILURE',
      null,
      {
        completedAt: '2026-10-25T09:00:00Z',
        checkSuiteId: 1,
        id: 11,
        runId: 100,
      },
    );

    const head = headChecksOf(
      [red, statusContext('no-skip-ci-label', 'SUCCESS')],
      reRunning,
      Date.parse('2026-10-25T09:30:00Z') + RE_RUN_GRACE_MS + 1,
    );

    assert.strictEqual(
      summarizeChecks(head.required, required, head.running).verdict,
      'failing',
    );
  });

  // #3334: the new round's aggregate, queued, lost to the red the cancelled
  // round left under the same name.
  test("waits on a queued aggregate of the new round over the cancelled round's red", () => {
    const summary = summarize([
      checkRun('code-check-result / result', 'COMPLETED', 'CANCELLED', null, {
        completedAt: '2026-10-25T09:00:00Z',
        checkSuiteId: 1,
        id: 10,
        runId: 100,
      }),
      checkRun('code-check-result / result', 'QUEUED', null, null, {
        checkSuiteId: 2,
        id: 20,
        runId: 200,
      }),
      statusContext('no-skip-ci-label', 'SUCCESS'),
    ]);

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failedRuns, []);
  });

  // No check still running has a start time, so only the newer run of the red's
  // workflow, its run id read from the links, says the red is the round before's.
  test('waits on a red of the round before while every running check is queued', () => {
    const summary = summarize([
      checkRun('code-check-result / result', 'COMPLETED', 'CANCELLED', null, {
        completedAt: '2026-10-25T09:00:00Z',
        checkSuiteId: 1,
        id: 10,
        runId: 100,
      }),
      checkRun('code-check (ws:fix:lint)', 'QUEUED', null, null, {
        isRequired: false,
        checkSuiteId: 2,
        id: 20,
        runId: 200,
      }),
      statusContext('no-skip-ci-label', 'SUCCESS'),
    ]);

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failedRuns, []);
  });

  // The window between a re-run job finishing and the aggregate that needs it
  // being created again: nothing in the workflow run is pending, but the run
  // has not finished.
  test('waits on a red aggregate after a re-run of a job it needs passed, while its workflow run goes on', () => {
    const summary = summarize(
      [
        checkRun('code-check (ws:fix:lint)', 'COMPLETED', 'FAILURE', null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 10,
          runId: 100,
        }),
        checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', null, {
          completedAt: '2026-10-25T09:00:00Z',
          checkSuiteId: 1,
          id: 11,
          runId: 100,
        }),
        checkRun('code-check (ws:fix:lint)', 'COMPLETED', 'SUCCESS', null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 12,
          runId: 100,
        }),
        statusContext('no-skip-ci-label', 'SUCCESS'),
      ],
      reRunning,
    );

    assert.strictEqual(summary.verdict, 'pending');
  });

  test('fails on a red aggregate once the workflow run of a re-run has finished without a new one', () => {
    const summary = summarize(
      [
        checkRun('code-check (ws:fix:lint)', 'COMPLETED', 'FAILURE', null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 10,
          runId: 100,
          suiteStatus: 'COMPLETED',
        }),
        checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', null, {
          completedAt: '2026-10-25T09:00:00Z',
          checkSuiteId: 1,
          id: 11,
          runId: 100,
          suiteStatus: 'COMPLETED',
        }),
        checkRun('code-check (ws:fix:lint)', 'COMPLETED', 'FAILURE', null, {
          isRequired: false,
          checkSuiteId: 1,
          id: 12,
          runId: 100,
          suiteStatus: 'COMPLETED',
        }),
        statusContext('no-skip-ci-label', 'SUCCESS'),
      ],
      new Map<number, WorkflowRound>([
        [
          1,
          {
            workflowId: 7,
            completed: true,
            attemptStartedAt: '2026-10-25T09:30:00Z',
          },
        ],
      ]),
    );

    assert.strictEqual(summary.verdict, 'failing');
  });

  // Sibling jobs with no aggregate after them, as `lint-pull-request.yml`'s
  // are: one still queued is not a re-run, and does not hold back the red of
  // another.
  test('fails on a red of the round still running while its sibling jobs are queued', () => {
    const summary = summarize([
      checkRun('code-check-result / result', 'COMPLETED', 'FAILURE', null, {
        completedAt: '2026-10-25T09:00:00Z',
        checkSuiteId: 2,
        id: 20,
        runId: 200,
      }),
      checkRun('code-check (ws:fix:lint)', 'QUEUED', null, null, {
        isRequired: false,
        checkSuiteId: 2,
        id: 21,
        runId: 200,
      }),
      statusContext('no-skip-ci-label', 'SUCCESS'),
    ]);

    assert.strictEqual(summary.verdict, 'failing');
  });

  // #3334: a commit status set pending long ago is not when the round began,
  // and taking it as that put the start before the round before's reds.
  test('does not take a pending commit status as the start of the round', () => {
    const summary = summarize([
      statusContext('some-app', 'PENDING', '2026-10-25T08:00:00Z', {
        isRequired: false,
      }),
      checkRun('code-check-result / result', 'COMPLETED', 'CANCELLED', null, {
        workflow: 'other',
        completedAt: '2026-10-25T09:00:00Z',
      }),
      checkRun(
        'code-check (ws:fix:lint)',
        'IN_PROGRESS',
        null,
        '2026-10-25T10:00:00Z',
        { isRequired: false },
      ),
      statusContext('no-skip-ci-label', 'SUCCESS'),
    ]);

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failedRuns, []);
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
        [
          checkRun('a', 'COMPLETED', 'SUCCESS'),
          checkRun('b', 'IN_PROGRESS', null),
        ],
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

  test('fails the poll, not lets a red through, when the run of the red cannot be read', async () => {
    const red = checkRun(
      'code-check-result / result',
      'COMPLETED',
      'FAILURE',
      null,
      { completedAt: minutesAgo(20), checkSuiteId: 1, id: 11, runId: 100 },
    );

    vi.stubGlobal('fetch', (url: string): Promise<Response> =>
      Promise.resolve(
        url.includes('/graphql')
          ? new Response(
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
                                    hasNextPage: false,
                                    endCursor: null,
                                  },
                                  nodes: [red],
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
            )
          : new Response('{}', { status: 404 }),
      ),
    );

    try {
      assert.isTrue(Result.isErr(await readHeadChecks(api, 1)));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  // #3474: the rule reads the workflow run over REST, and only for a red.
  test('reads the workflow run of a red, and holds the red of the attempt before', async () => {
    const mut_urls: string[] = [];

    const red = checkRun(
      'code-check-result / result',
      'COMPLETED',
      'FAILURE',
      null,
      {
        // Within the grace of the attempt below, whenever the test runs.
        completedAt: minutesAgo(20),
        checkSuiteId: 1,
        id: 11,
        runId: 100,
      },
    );

    vi.stubGlobal('fetch', (url: string): Promise<Response> => {
      mut_urls.push(url);

      const body = url.includes('/graphql')
        ? ({
            data: {
              repository: {
                pullRequest: {
                  commits: {
                    nodes: [
                      {
                        commit: {
                          statusCheckRollup: {
                            contexts: {
                              pageInfo: { hasNextPage: false, endCursor: null },
                              nodes: [red],
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          } as const)
        : ({
            check_suite_id: 1,
            workflow_id: 7,
            status: 'in_progress',
            run_started_at: minutesAgo(10),
          } as const);

      return Promise.resolve(
        new Response(JSON.stringify(body), { status: 200 }),
      );
    });

    try {
      const checks = Result.unwrapThrow(await readHeadChecks(api, 1));

      assert.lengthOf(mut_urls, 2);

      assert.include(mut_urls[1], '/actions/runs/100');

      assert.deepStrictEqual(
        checks.required.map(({ reRunAfter }) => reRunAfter),
        [true],
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('reads a head of several pages twice, and takes both lists from the later read', async () => {
    const sent = stubRollupPages([
      [
        [checkRun('a', 'COMPLETED', 'SUCCESS')],
        [checkRun('b', 'IN_PROGRESS', null)],
      ],
      [
        [checkRun('a', 'COMPLETED', 'SUCCESS')],
        [checkRun('b', 'COMPLETED', 'SUCCESS')],
      ],
    ]);

    try {
      const checks = Result.unwrapThrow(await readHeadChecks(api, 1));

      assert.deepStrictEqual(sent, [
        undefined,
        'cursor-1',
        undefined,
        'cursor-1',
      ]);

      assert.deepStrictEqual(
        checks.required.map(({ name }) => name),
        ['a', 'b'],
      );

      // The later read's state, its list being the same.
      assert.deepStrictEqual(checks.running, []);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('reads again when the list moved under the cursor, until it holds still', async () => {
    const sent = stubRollupPages([
      // `b` skipped at the boundary.
      [
        [checkRun('a', 'COMPLETED', 'SUCCESS')],
        [checkRun('c', 'COMPLETED', 'SUCCESS')],
      ],
      [
        [
          checkRun('a', 'COMPLETED', 'SUCCESS'),
          checkRun('b', 'IN_PROGRESS', null),
        ],
        [checkRun('c', 'COMPLETED', 'SUCCESS')],
      ],
      [
        [
          checkRun('a', 'COMPLETED', 'SUCCESS'),
          checkRun('b', 'IN_PROGRESS', null),
        ],
        [checkRun('c', 'COMPLETED', 'SUCCESS')],
      ],
    ]);

    try {
      const checks = Result.unwrapThrow(await readHeadChecks(api, 1));

      assert.lengthOf(sent, 6);

      assert.deepStrictEqual(
        checks.running.map(({ name }) => name),
        ['b'],
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('takes a context read twice at the boundary for a list that moved', async () => {
    const sent = stubRollupPages([
      [
        [checkRun('a', 'COMPLETED', 'SUCCESS')],
        [
          checkRun('a', 'COMPLETED', 'SUCCESS'),
          checkRun('b', 'COMPLETED', 'SUCCESS'),
        ],
      ],
      [
        [checkRun('a', 'COMPLETED', 'SUCCESS')],
        [checkRun('b', 'COMPLETED', 'SUCCESS')],
      ],
      [
        [checkRun('a', 'COMPLETED', 'SUCCESS')],
        [checkRun('b', 'COMPLETED', 'SUCCESS')],
      ],
    ]);

    try {
      assert.isTrue(Result.isOk(await readHeadChecks(api, 1)));

      assert.lengthOf(sent, 6);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('fails on a list that never holds still, after a bounded number of reads', async () => {
    const sent = stubRollupPages(
      [1, 2, 3, 4, 5, 6, 7, 8].map((id) => [
        [checkRun('a', 'COMPLETED', 'SUCCESS')],
        [checkRun(`b${id}`, 'IN_PROGRESS', null)],
      ]),
    );

    try {
      const read = await readHeadChecks(api, 1);

      assert.isTrue(Result.isErr(read));

      assert.include(read.value, 'kept changing');

      assert.lengthOf(sent, 8);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

/**
 * Stubs `fetch` to answer the rollup query with `reads` in turn, each a read of
 * its pages, each page but a read's last pointing at the next by the cursor
 * `cursor-<n>`, and returns the `after` each request asked from, as it is sent.
 */
const stubRollupPages = (
  reads: readonly (readonly (readonly CheckContextNode[])[])[],
): readonly (string | undefined)[] => {
  const pages = reads.flatMap((read) =>
    read.map((nodes, at) => ({
      nodes,
      next: at + 1 < read.length ? `cursor-${at + 1}` : null,
    })),
  );

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

      const page = pages[index];

      const endCursor = page?.next ?? null;

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
                                hasNextPage: endCursor !== null,
                                endCursor,
                              },
                              nodes: page?.nodes ?? [],
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
  {
    isRequired = true,
    event = 'pull_request',
    workflow = 'code-check',
    completedAt = conclusion === null ? null : '2026-10-25T10:05:00Z',
    checkSuiteId,
    id,
    runId,
    suiteStatus = 'IN_PROGRESS',
  }: CheckRunOptions = {},
): CheckContextNode =>
  ({
    __typename: 'CheckRun',
    databaseId: id ?? null,
    name,
    status,
    conclusion,
    startedAt,
    completedAt,
    detailsUrl: linkOf(name, runId),
    isRequired,
    checkSuite: {
      databaseId: checkSuiteId ?? null,
      status: suiteStatus,
      workflowRun: { event, workflow: { name: workflow } },
    },
  }) as const;

type CheckRunOptions = Readonly<{
  isRequired?: boolean;
  event?: string;
  workflow?: string;
  completedAt?: string | null;
  /** Its check suite, which is its workflow run's: one per run, not attempt. */
  checkSuiteId?: number;
  /** The check run's own id; a re-run of the job is a new check run. */
  id?: number;
  /** The workflow run in its link, which a re-run keeps. */
  runId?: number;
  /** Its check suite's, `COMPLETED` once the workflow run has finished. */
  suiteStatus?: string;
}>;

const statusContext = (
  context: string,
  state: string,
  createdAt = '2026-10-25T10:00:00Z',
  { isRequired = true }: Readonly<{ isRequired?: boolean }> = {},
): CheckContextNode =>
  ({
    __typename: 'StatusContext',
    context,
    state,
    targetUrl: null,
    createdAt,
    isRequired,
  }) as const;

/** When the fixtures are read: after every time in them, within the grace. */
const NOW_MS = Date.parse('2026-10-25T09:40:00Z');

/** An ISO 8601 time `minutes` before the test runs. */
const minutesAgo = (minutes: number): string => {
  const at = new Date(Date.now() - minutes * 60 * 1000);

  return at.toISOString();
};
