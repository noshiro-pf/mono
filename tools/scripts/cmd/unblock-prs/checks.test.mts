import {
  describeWaitingOn,
  summarizeChecks,
  type ReportedCheck,
  type RunningCheck,
} from './checks.mjs';

describe(summarizeChecks, () => {
  const required = ['code-check-result / result', 'no-skip-ci-label'] as const;

  test('passes when every required context passed and nothing is running', () => {
    const summary = summarizeChecks(
      [check('code-check-result / result', 'pass'), check('no-skip-ci-label')],
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
  // new round's first check started. Its workflow's own new run, queued
  // behind it by the concurrency group, is what says it is the round before.
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
        check('code-check-result / result', 'pass'),
        check('code-check-result / result', 'fail'),
        check('no-skip-ci-label'),
      ],
      required,
      [],
    );

    assert.strictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);
  });

  // The worker arms a pull request it judges green, and an armed pull
  // request stacked on a branch no ruleset covers merges into it at once.
  // So a required context that has not reported is waited for wherever the
  // pull request points, unlike in `pr-report`'s `notRun`.
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

const check = (
  name: string,
  bucket: string = 'pass',
  {
    completedAt = '',
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
    link: link(name, runId),
    startedAt: completedAt,
    completedAt,
    workflow,
  }) as const;

const running = (
  name: string,
  startedAt: string = '',
  {
    workflow = '',
    runId,
  }: Readonly<{ workflow?: string; runId?: number }> = {},
): RunningCheck =>
  ({ name, startedAt, workflow, link: link(name, runId) }) as const;

/** What `gh` reports for a job of a workflow run, or a status's own URL. */
const link = (name: string, runId: number | undefined): string =>
  runId === undefined
    ? (`https://example.com/${name}` as const)
    : (`https://github.com/noshiro-pf/mono/actions/runs/${runId}/job/1` as const);
