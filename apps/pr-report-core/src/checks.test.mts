import {
  classifyCheckRun,
  classifyCommitStatus,
  combineContextStates,
  reportedContexts,
  statesFromCheckRuns,
  summarizeChecks,
} from './checks.mjs';

describe(classifyCheckRun, () => {
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

describe(classifyCommitStatus, () => {
  test('reads the four states a commit status has', () => {
    assert.deepStrictEqual(classifyCommitStatus('success'), 'passed');

    assert.deepStrictEqual(classifyCommitStatus('pending'), 'pending');

    assert.deepStrictEqual(classifyCommitStatus('failure'), 'failed');

    assert.deepStrictEqual(classifyCommitStatus('error'), 'failed');
  });
});

describe(summarizeChecks, () => {
  const required = ['code-check-result / result', 'no-skip-ci-label'] as const;

  test('every required context green is a pass', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result / result', 'passed'],
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
      reported: new Map([['code-check-result / result', 'passed']]),
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
        ['code-check-result / result', 'failed'],
        ['no-skip-ci-label', 'pending'],
      ]),
      paused: false,
    });

    assert.deepStrictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);
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
        ['code-check-result / result', 'failed'],
        ['no-skip-ci-label', 'pending'],
      ]),
      paused: true,
    });

    assert.deepStrictEqual(summary.verdict, 'paused');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);

    assert.deepStrictEqual(summary.pending, ['no-skip-ci-label']);
  });

  test('a context nothing requires is not counted', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result / result', 'passed'],
        ['no-skip-ci-label', 'passed'],
        ['some-optional-job', 'failed'],
      ]),
      paused: false,
    });

    assert.deepStrictEqual(summary.verdict, 'passed');

    assert.deepStrictEqual(summary.failed, []);
  });
});

// The numbers below are from noshiro-pf/mono#2021 at 864f8099, where the
// `opened` runs were cancelled by the `labeled` ones and both stayed on the
// commit.
const run = (
  name: string,
  conclusion: string,
  checkSuiteId: number,
  id: number,
) => ({ name, status: 'completed', conclusion, checkSuiteId, id }) as const;

describe(statesFromCheckRuns, () => {
  test('the run in the later suite is the one that counts', () => {
    // `code-check-result / result`: the cancelled suite was created first, so
    // the green that superseded it is what GitHub answers with.
    const states = statesFromCheckRuns([
      run(
        'code-check-result / result',
        'success',
        96_234_480_526,
        106_168_151_475,
      ),
      run(
        'code-check-result / result',
        'failure',
        96_234_480_291,
        106_166_534_044,
      ),
    ]);

    assert.deepStrictEqual(states.get('code-check-result / result'), 'passed');
  });

  test('a stale red in a later suite still holds the merge', () => {
    // `test-node-versions-result`, the one context of the five that blocked
    // #2021: the cancelled suite happens to have the greater id, so GitHub
    // reports the failure however much later the green one finished. Reading
    // the newest `started_at` instead would call this pull request green
    // while GitHub blocks it.
    const states = statesFromCheckRuns([
      run(
        'test-node-versions-result / result',
        'success',
        96_234_480_391,
        106_167_733_967,
      ),
      run(
        'test-node-versions-result / result',
        'failure',
        96_234_480_438,
        106_166_533_069,
      ),
    ]);

    assert.deepStrictEqual(
      states.get('test-node-versions-result / result'),
      'failed',
    );
  });

  test('the order the runs arrive in does not decide it', () => {
    const forwards = statesFromCheckRuns([
      run('style-check-result / result', 'failure', 96_234_480_277, 1),
      run('style-check-result / result', 'success', 96_234_480_875, 2),
    ]);

    const backwards = statesFromCheckRuns([
      run('style-check-result / result', 'success', 96_234_480_875, 2),
      run('style-check-result / result', 'failure', 96_234_480_277, 1),
    ]);

    assert.deepStrictEqual(
      forwards.get('style-check-result / result'),
      'passed',
    );

    assert.deepStrictEqual(
      backwards.get('style-check-result / result'),
      'passed',
    );
  });

  test('a re-run inside one suite is told apart by its id', () => {
    const states = statesFromCheckRuns([
      run('code-check (check:knip)', 'failure', 96_234_480_526, 1),
      run('code-check (check:knip)', 'success', 96_234_480_526, 2),
    ]);

    assert.deepStrictEqual(states.get('code-check (check:knip)'), 'passed');
  });

  test('a name reported once is left as it is', () => {
    const states = statesFromCheckRuns([
      run('coverage-main', 'skipped', 96_234_480_526, 106_166_639_842),
    ]);

    assert.deepStrictEqual(states.get('coverage-main'), 'passed');
  });
});

describe(combineContextStates, () => {
  test('a red check run is not covered by a green status of the same name', () => {
    // GitHub: "If a check and a commit status have the same name, both must
    // pass when that name is required."
    assert.deepStrictEqual(combineContextStates('failed', 'passed'), 'failed');

    assert.deepStrictEqual(combineContextStates('passed', 'failed'), 'failed');
  });

  test('one still running holds the pair', () => {
    assert.deepStrictEqual(
      combineContextStates('passed', 'pending'),
      'pending',
    );

    assert.deepStrictEqual(combineContextStates('failed', 'pending'), 'failed');
  });

  test('both green is green', () => {
    assert.deepStrictEqual(combineContextStates('passed', 'passed'), 'passed');
  });
});

describe(reportedContexts, () => {
  test('reads check runs and commit statuses together', () => {
    assert.deepStrictEqual(
      reportedContexts(
        [completedRun('code-check-result / result', 'success')],
        [{ context: 'no-skip-ci-label', state: 'pending' }],
      ),
      new Map([
        ['code-check-result / result', 'passed'],
        ['no-skip-ci-label', 'pending'],
      ]),
    );
  });

  test('keeps the stricter of a check run and a status of one name', () => {
    assert.deepStrictEqual(
      reportedContexts(
        [completedRun('lint', 'failure')],
        [{ context: 'lint', state: 'success' }],
      ),
      new Map([['lint', 'failed']]),
    );

    assert.deepStrictEqual(
      reportedContexts(
        [completedRun('lint', 'success')],
        [{ context: 'lint', state: 'pending' }],
      ),
      new Map([['lint', 'pending']]),
    );
  });
});

const completedRun = (name: string, conclusion: string) =>
  ({
    name,
    status: 'completed',
    conclusion,
    checkSuiteId: 1,
    id: 1,
  }) as const;
