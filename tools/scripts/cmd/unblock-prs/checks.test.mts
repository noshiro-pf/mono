import { describeWaitingOn, summarizeChecks } from './checks.mjs';

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
      ['code-check (ws:fix:lint)'],
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
      ['code-check-result / result', 'code-check (ws:fix:lint)'],
    );

    assert.deepStrictEqual(summary.pending, ['code-check-result / result']);

    assert.deepStrictEqual(summary.running, ['code-check (ws:fix:lint)']);
  });

  test('fails on a failed required check even while others run', () => {
    const summary = summarizeChecks(
      [check('code-check-result / result', 'fail'), check('no-skip-ci-label')],
      required,
      ['code-check (ws:fix:lint)'],
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
): Readonly<{ name: string; bucket: string; link: string }> =>
  ({
    name,
    bucket,
    link: '',
  }) as const;
