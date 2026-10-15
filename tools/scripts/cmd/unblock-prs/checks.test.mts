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

    assert.strictEqual(summary.status, 'passed');
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

    assert.strictEqual(summary.status, 'passed');
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

    assert.strictEqual(summary.status, 'pending');

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

    assert.strictEqual(summary.status, 'failed');
  });

  test('fails on a required check that failed in the round still running', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'fail', '2026-10-12T15:20:45Z'),
        check('no-skip-ci-label'),
      ],
      required,
      [running('code-check (ws:fix:lint)', '2026-10-12T15:20:14Z')],
    );

    assert.strictEqual(summary.status, 'failed');

    assert.deepStrictEqual(
      summary.failed.map(({ name }) => name),
      ['code-check-result / result'],
    );
  });

  // #2246: the round `skip-ci` cancelled when the pull request was opened
  // left the aggregates red, and `skip-ci` came off the same head.
  test('waits on a required check that failed before the round still running began', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'cancel', '2026-10-12T12:13:37Z'),
        check('no-skip-ci-label'),
      ],
      required,
      [running('code-check (ws:fix:lint)', '2026-10-12T15:20:14Z')],
    );

    assert.strictEqual(summary.status, 'pending');

    assert.deepStrictEqual(summary.failed, []);

    assert.deepStrictEqual(summary.pending, ['code-check-result / result']);
  });

  test('fails on a red left by the round before once nothing runs', () => {
    const summary = summarizeChecks(
      [
        check('code-check-result / result', 'fail', '2026-10-12T12:13:37Z'),
        check('no-skip-ci-label'),
      ],
      required,
      [],
    );

    assert.strictEqual(summary.status, 'failed');
  });

  test('stays pending while a required context has not reported', () => {
    const summary = summarizeChecks([check('no-skip-ci-label')], required, []);

    assert.strictEqual(summary.status, 'pending');

    assert.deepStrictEqual(summary.missing, ['code-check-result / result']);
  });
});

const check = (
  name: string,
  bucket: string = 'pass',
  /** When it finished, which is also taken as when it started. */
  completedAt: string = '',
): ReportedCheck =>
  ({
    name,
    bucket,
    link: '',
    startedAt: completedAt,
    completedAt,
  }) as const;

const running = (name: string, startedAt: string = ''): RunningCheck =>
  ({ name, startedAt }) as const;
