import { Arr } from 'ts-data-forge';
import {
  anyRunInProgress,
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

  // The gated jobs skip on `skip-ci` and on a diff the workflow does not
  // read; GitHub counts that as met, so reading it as a failure would call
  // every gated pull request red. `summarizeChecks` still counts it as met —
  // but it is reported as what it was, because folding it into `passed` is
  // what let a failing pull request show a tick.
  test('a skipped job is reported as skipped, not as passed', () => {
    assert.deepStrictEqual(classifyCheckRun('completed', 'skipped'), 'skipped');

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
      running: false,
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
      running: false,
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
      running: false,
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
      running: false,
    });

    assert.deepStrictEqual(summary.verdict, 'paused');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);

    assert.deepStrictEqual(summary.pending, ['no-skip-ci-label']);
  });

  test('a skipped context counts as met and is listed as skipped', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result / result', 'skipped'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
      running: false,
    });

    assert.deepStrictEqual(summary.verdict, 'passed');

    assert.deepStrictEqual(summary.passed, ['no-skip-ci-label']);

    assert.deepStrictEqual(summary.skipped, ['code-check-result / result']);
  });

  test('anything still running on the commit keeps the verdict pending', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result / result', 'passed'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
      running: true,
    });

    assert.deepStrictEqual(summary.verdict, 'pending');

    // Nothing required is pending: what is running is something else.
    assert.deepStrictEqual(summary.pending, []);
  });

  test('a failure is not hidden by something still running', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map([
        ['code-check-result / result', 'failed'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
      running: true,
    });

    assert.deepStrictEqual(summary.verdict, 'failing');
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
      running: false,
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

    assert.deepStrictEqual(states.get('coverage-main'), 'skipped');
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

  test('a skip beside a pass is still said to be a skip', () => {
    // Both count as met, so neither holds the pair; but "passed" would claim
    // that something ran and went green, which of the two only one did.
    assert.deepStrictEqual(
      combineContextStates('skipped', 'passed'),
      'skipped',
    );

    assert.deepStrictEqual(
      combineContextStates('passed', 'skipped'),
      'skipped',
    );

    assert.deepStrictEqual(
      combineContextStates('skipped', 'pending'),
      'pending',
    );

    assert.deepStrictEqual(combineContextStates('skipped', 'failed'), 'failed');
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

describe(anyRunInProgress, () => {
  test('is true while any run on the commit has not completed', () => {
    assert.isTrue(
      anyRunInProgress([
        completedRun('code-check-result / result', 'success'),
        {
          name: 'code-check (check:knip)',
          status: 'queued',
          conclusion: undefined,
          checkSuiteId: 2,
          id: 2,
        },
      ]),
    );
  });

  test('is false once every run has completed, whatever it concluded', () => {
    assert.isFalse(
      anyRunInProgress([
        completedRun('code-check-result / result', 'failure'),
        completedRun('style-check-result / result', 'skipped'),
      ]),
    );

    assert.isFalse(anyRunInProgress([]));
  });
});

/**
 * The state #2031 was in when the page showed it a tick.
 *
 * `skip-ci` came off, which started a new round. The old round's
 * `code-check-result` had concluded `skipped` and was the only run of that
 * name on the commit — the new round's aggregate does not exist until the
 * jobs it waits on are done. Folding `skipped` into `passed` then made the
 * pull request look settled and green, two minutes before
 * `code-check-result` concluded `failure`.
 */
describe('a required context in a superseded round', () => {
  const required = [
    'code-check-result / result',
    'style-check-result / result',
  ] as const;

  const runs = [
    // The round that was cancelled when the label came off.
    {
      id: 1,
      checkSuiteId: 96_510_172_224,
      name: 'code-check-result / result',
      status: 'completed',
      conclusion: 'skipped',
    },
    {
      id: 2,
      checkSuiteId: 96_510_173_749,
      name: 'style-check-result / result',
      status: 'completed',
      conclusion: 'skipped',
    },
    // The round that replaced it, still going: its aggregates have not been
    // created yet, only the jobs they wait on.
    {
      id: 3,
      checkSuiteId: 96_511_684_948,
      name: 'code-check (ws:fix:lint)',
      status: 'in_progress',
      conclusion: undefined,
    },
  ] as const;

  test('reads a skip as a skip rather than as a pass', () => {
    assert.deepStrictEqual(
      statesFromCheckRuns(runs).get('code-check-result / result'),
      'skipped',
    );
  });

  // The regression: this said `passed`.
  test('does not call it passed while the round is still running', () => {
    const summary = summarizeChecks({
      required,
      reported: statesFromCheckRuns(runs),
      paused: false,
      running: anyRunInProgress(runs),
    });

    assert.deepStrictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.passed, []);

    assert.deepStrictEqual(summary.skipped, [
      'code-check-result / result',
      'style-check-result / result',
    ]);
  });

  // And once it finishes, the failure is what shows.
  test('reports the failure the round went on to produce', () => {
    const summary = summarizeChecks({
      required,
      reported: statesFromCheckRuns([
        ...Arr.take(runs, 2),
        {
          id: 4,
          checkSuiteId: 96_511_684_948,
          name: 'code-check-result / result',
          status: 'completed',
          conclusion: 'failure',
        },
        {
          id: 5,
          checkSuiteId: 96_511_684_934,
          name: 'style-check-result / result',
          status: 'completed',
          conclusion: 'success',
        },
      ]),
      paused: false,
      running: false,
    });

    assert.deepStrictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);

    assert.deepStrictEqual(summary.passed, ['style-check-result / result']);
  });
});
