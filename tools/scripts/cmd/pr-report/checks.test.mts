import {
  classifyCheckRun,
  classifyCommitStatus,
  summarizeChecks,
} from './checks.mjs';

describe('classifyCheckRun', () => {
  test('an unfinished run is pending whatever it last concluded', () => {
    assert.deepStrictEqual(classifyCheckRun('queued', undefined), 'pending');

    assert.deepStrictEqual(
      classifyCheckRun('in_progress', 'failure'),
      'pending',
    );
  });

  test('a skipped job satisfies a required check', () => {
    // The gated jobs skip on `skip-ci` and on a diff the workflow does not
    // read; GitHub counts that as met, so reading it as a failure would call
    // every gated pull request red.
    assert.deepStrictEqual(classifyCheckRun('completed', 'skipped'), 'passed');

    assert.deepStrictEqual(classifyCheckRun('completed', 'neutral'), 'passed');

    assert.deepStrictEqual(classifyCheckRun('completed', 'success'), 'passed');
  });

  test('anything else that finished is a failure', () => {
    for (const conclusion of [
      'action_required',
      'cancelled',
      'failure',
      'stale',
      'timed_out',
    ]) {
      assert.deepStrictEqual(
        classifyCheckRun('completed', conclusion),
        'failed',
      );
    }
  });
});

describe('classifyCommitStatus', () => {
  test('reads the four states a commit status has', () => {
    assert.deepStrictEqual(classifyCommitStatus('success'), 'passed');

    assert.deepStrictEqual(classifyCommitStatus('pending'), 'pending');

    assert.deepStrictEqual(classifyCommitStatus('failure'), 'failed');

    assert.deepStrictEqual(classifyCommitStatus('error'), 'failed');
  });
});

describe('summarizeChecks', () => {
  const required = ['code-check-result', 'no-skip-ci-label'] as const;

  test('every required context green is a pass', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result', 'passed'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
    });

    assert.deepStrictEqual(summary.verdict, 'passed');

    assert.deepStrictEqual(summary.required, 2);
  });

  test('a required context with nothing reported is missing, not passed', () => {
    // GitHub shows these as "Expected — waiting for status to be reported":
    // absent from the check list rather than pending in it.
    const summary = summarizeChecks({
      required,
      reported: new Map([['code-check-result', 'passed']]),
      paused: false,
    });

    assert.deepStrictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.missing, ['no-skip-ci-label']);

    assert.deepStrictEqual(summary.pending, []);
  });

  test('a failure outranks anything still running', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result', 'failed'],
        ['no-skip-ci-label', 'pending'],
      ]),
      paused: false,
    });

    assert.deepStrictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result']);
  });

  test('`skip-ci` is a pause, and the detail is still reported', () => {
    // While the label is on, the gated jobs boot no runner and
    // `no-skip-ci-label` sits `pending` by design. Calling that "failing"
    // would make every queued pull request look broken; the red left by the
    // cancelled `opened` run is still listed, because it is what a reader
    // asks about.
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result', 'failed'],
        ['no-skip-ci-label', 'pending'],
      ]),
      paused: true,
    });

    assert.deepStrictEqual(summary.verdict, 'paused');

    assert.deepStrictEqual(summary.failed, ['code-check-result']);

    assert.deepStrictEqual(summary.pending, ['no-skip-ci-label']);
  });

  test('a context nothing requires is not counted', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result', 'passed'],
        ['no-skip-ci-label', 'passed'],
        ['some-optional-job', 'failed'],
      ]),
      paused: false,
    });

    assert.deepStrictEqual(summary.verdict, 'passed');

    assert.deepStrictEqual(summary.failed, []);
  });
});
