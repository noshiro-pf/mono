import { Arr } from 'ts-data-forge';
import type {
  CommitStatusFacts,
  HeadChecks,
  WorkflowRoundFacts,
} from '../snapshot/index.mjs';
import {
  checkRunStates,
  classifyCheckRun,
  classifyCommitStatus,
  combineContextStates,
  contextStates,
  isOfEarlierAttempt,
  isRunning,
  outranks,
  RE_RUN_GRACE_MS,
  summarizeChecks,
  winningRuns,
  workflowRunOf,
  type ContextState,
} from './checks.mjs';

/** What a round has that these tests do not read. */
const ROUND_REST = {
  headBranch: 'feature',
  path: '.github/workflows/code-check.yml',
  event: 'pull_request',
  status: 'completed',
  conclusion: undefined,
  createdAt: '2026-11-07T10:00:00Z',
  updatedAt: '2026-11-07T10:00:00Z',
  url: '',
} as const;

// v1's tests, ported as they were: a run there carried its round, and the shims
// below build the head v2 reads from the same fixtures.

type WorkflowRound = Readonly<{
  workflowId: number;
  completed: boolean;
  attemptStartedAt?: string | undefined;
}>;

type FixtureRun = Readonly<{
  name: string;
  status: string;
  conclusion: string | undefined;
  checkSuiteId: number;
  id: number;
  completedAt?: string | undefined;
  round: WorkflowRound | undefined;
}>;

const headOf = (
  runs: readonly FixtureRun[],
  statuses: readonly Readonly<{ context: string; state: string }>[] = [],
  rounds: ReadonlyMap<number, WorkflowRound> = new Map<number, WorkflowRound>(),
): HeadChecks => {
  const roundFacts = (
    checkSuiteId: number,
    round: WorkflowRound,
  ): WorkflowRoundFacts =>
    ({
      checkSuiteId,
      runId: checkSuiteId,
      workflowId: round.workflowId,
      completed: round.completed,
      attemptStartedAt: round.attemptStartedAt,
      ...ROUND_REST,
    }) as const;

  const fromRuns = Arr.generate(function* () {
    for (const fixture of runs) {
      if (fixture.round !== undefined) {
        yield roundFacts(fixture.checkSuiteId, fixture.round);
      }
    }
  });

  const ofRuns = new Set(fromRuns.map(({ checkSuiteId }) => checkSuiteId));

  return {
    sha: 'f'.repeat(40),
    runs: runs.map((each) => ({
      name: each.name,
      status: each.status,
      conclusion: each.conclusion,
      checkSuiteId: each.checkSuiteId,
      id: each.id,
      startedAt: undefined,
      completedAt: each.completedAt,
      annotationTitles: undefined,
      url: '',
    })),
    statuses: statuses.map(({ context, state }): CommitStatusFacts => ({
      context,
      state,
      url: undefined,
    })),
    rounds: [
      ...fromRuns,
      ...Array.from(rounds)
        .filter(([checkSuiteId]) => !ofRuns.has(checkSuiteId))
        .map(([checkSuiteId, round]) => roundFacts(checkSuiteId, round)),
    ],
  };
};

const statesFromCheckRuns = (
  runs: readonly FixtureRun[],
  nowMs: number = Date.now(),
  rounds: ReadonlyMap<number, WorkflowRound> = new Map<number, WorkflowRound>(),
): ReadonlyMap<string, ContextState> => {
  const head = headOf(runs, [], rounds);

  return checkRunStates(head.runs, head.rounds, nowMs);
};

const reportedContexts = (
  runs: readonly FixtureRun[],
  statuses: readonly Readonly<{ context: string; state: string }>[],
  nowMs: number = Date.now(),
  rounds: ReadonlyMap<number, WorkflowRound> = new Map<number, WorkflowRound>(),
): ReadonlyMap<string, ContextState> =>
  contextStates(headOf(runs, statuses, rounds), nowMs);

const anyRunInProgress = (
  runs: readonly FixtureRun[],
  rounds: ReadonlyMap<number, WorkflowRound> = new Map<number, WorkflowRound>(),
): boolean => isRunning(headOf(runs, [], rounds));

describe(classifyCheckRun, () => {
  test('an unfinished run is pending whatever it last concluded', () => {
    assert.strictEqual(classifyCheckRun('queued', undefined), 'pending');

    assert.strictEqual(classifyCheckRun('in_progress', 'failure'), 'pending');
  });

  // The gated jobs skip on `skip-ci` and on a diff the workflow does not read;
  // GitHub counts that as met, so reading it as a failure would call every
  // gated pull request red. `summarizeChecks` still counts it as met — but it
  // is reported as what it was, because folding it into `passed` is what let a
  // failing pull request show a tick.
  test('a skipped job is reported as skipped, not as passed', () => {
    assert.strictEqual(classifyCheckRun('completed', 'skipped'), 'skipped');

    assert.strictEqual(classifyCheckRun('completed', 'neutral'), 'passed');

    assert.strictEqual(classifyCheckRun('completed', 'success'), 'passed');
  });

  test('anything else that finished is a failure', () => {
    for (const conclusion of [
      'action_required',
      'cancelled',
      'failure',
      'stale',
      'timed_out',
    ]) {
      assert.strictEqual(classifyCheckRun('completed', conclusion), 'failed');
    }
  });
});

describe(classifyCommitStatus, () => {
  test('reads the four states a commit status has', () => {
    assert.strictEqual(classifyCommitStatus('success'), 'passed');

    assert.strictEqual(classifyCommitStatus('pending'), 'pending');

    assert.strictEqual(classifyCommitStatus('failure'), 'failed');

    assert.strictEqual(classifyCommitStatus('error'), 'failed');
  });

  // Changed in v2: GraphQL's `expected` is a required status not reported yet.
  test('an expected status is pending', () => {
    assert.strictEqual(classifyCommitStatus('expected'), 'pending');
  });
});

describe(summarizeChecks, () => {
  const required = ['code-check-result / result', 'no-skip-ci-label'] as const;

  test('every required context green is a pass', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'passed'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
      running: false,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'passed');

    assert.strictEqual(summary.required, 2);
  });

  test('a required context with nothing reported is missing, not passed', () => {
    // GitHub shows these as "Expected — waiting for status to be reported":
    // absent from the check list rather than pending in it.
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'passed'],
      ]),
      paused: false,
      running: false,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.missing, ['no-skip-ci-label']);

    assert.deepStrictEqual(summary.pending, []);
  });

  test('a failure outranks anything still running', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'failed'],
        ['no-skip-ci-label', 'pending'],
      ]),
      paused: false,
      running: false,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);
  });

  test('`skip-ci` is a pause, and the detail is still reported', () => {
    // While the label is on, the gated jobs boot no runner and
    // `no-skip-ci-label` sits `pending` by design. Calling that "failing" would
    // make every queued pull request look broken; the red left by the cancelled
    // `opened` run is still listed, because it is what a reader asks about.
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'failed'],
        ['no-skip-ci-label', 'pending'],
      ]),
      paused: true,
      running: false,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'paused');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);

    assert.deepStrictEqual(summary.pending, ['no-skip-ci-label']);
  });

  test('a skipped context counts as met and is listed as skipped', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'skipped'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
      running: false,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'passed');

    assert.deepStrictEqual(summary.passed, ['no-skip-ci-label']);

    assert.deepStrictEqual(summary.skipped, ['code-check-result / result']);
  });

  test('anything still running on the commit keeps the verdict pending', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'passed'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
      running: true,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'pending');

    // Nothing required is pending: what is running is something else.
    assert.deepStrictEqual(summary.pending, []);
  });

  test('a failure is not hidden by something still running', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'failed'],
        ['no-skip-ci-label', 'passed'],
      ]),
      paused: false,
      running: true,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'failing');
  });

  test('a context nothing requires is not counted', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'passed'],
        ['no-skip-ci-label', 'passed'],
        ['some-optional-job', 'failed'],
      ]),
      paused: false,
      running: false,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'passed');

    assert.deepStrictEqual(summary.failed, []);
  });

  // #2103, stacked on `chore/pnpm-update`: `lint-pull-request.yml` runs on
  // pull requests into `main` only, so its three contexts never came, and the
  // page kept calling a pull request whose checks had all passed "checks
  // running".
  describe('on a base the ruleset does not cover', () => {
    const withLint = Arr.toPushed(required, 'Validate PR title');

    test('a context that never reported is not waited for', () => {
      const summary = summarizeChecks({
        required: withLint,
        reported: new Map<string, ContextState>([
          ['code-check-result / result', 'passed'],
          ['no-skip-ci-label', 'passed'],
        ]),
        paused: false,
        running: false,
        baseCovered: false,
      });

      assert.strictEqual(summary.verdict, 'passed');

      assert.deepStrictEqual(summary.notRun, ['Validate PR title']);

      assert.deepStrictEqual(summary.missing, []);

      assert.strictEqual(summary.required, 3);
    });

    test('while nothing required has reported, everything is still coming', () => {
      // Between a push and the first check suite, a head commit has nothing on
      // it at all; that is not a pass over zero contexts.
      const summary = summarizeChecks({
        required: withLint,
        reported: new Map<string, ContextState>(),
        paused: false,
        running: false,
        baseCovered: false,
      });

      assert.strictEqual(summary.verdict, 'pending');

      assert.deepStrictEqual(summary.missing, withLint);

      assert.deepStrictEqual(summary.notRun, []);
    });

    test('a context that reported is judged as anywhere else', () => {
      const summary = summarizeChecks({
        required: withLint,
        reported: new Map<string, ContextState>([
          ['code-check-result / result', 'failed'],
          ['no-skip-ci-label', 'pending'],
        ]),
        paused: false,
        running: false,
        baseCovered: false,
      });

      assert.strictEqual(summary.verdict, 'failing');

      assert.deepStrictEqual(summary.pending, ['no-skip-ci-label']);
    });
  });

  test('on a base the ruleset covers, nothing is excused from reporting', () => {
    const summary = summarizeChecks({
      required,
      reported: new Map<string, ContextState>([
        ['code-check-result / result', 'passed'],
      ]),
      paused: false,
      running: false,
      baseCovered: true,
    });

    assert.deepStrictEqual(summary.missing, ['no-skip-ci-label']);

    assert.deepStrictEqual(summary.notRun, []);
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
) =>
  ({
    name,
    status: 'completed',
    conclusion,
    checkSuiteId,
    id,
    round: undefined,
  }) as const;

describe(winningRuns, () => {
  test('answers the run in the later suite, and within one the later run', () => {
    const winners = winningRuns([
      run('a', 'failure', 2, 10),
      run('a', 'success', 1, 99),
      run('b', 'failure', 1, 5),
      run('b', 'success', 1, 6),
    ]);

    assert.deepStrictEqual(
      Array.from(winners, ([name, { id }]) => [name, id]),
      [
        ['a', 10],
        ['b', 6],
      ],
    );
  });
});

describe(statesFromCheckRuns, () => {
  // #3703: the run replacing a cancelled one is held by its concurrency group,
  // with no job and so no check run, while the reds it cancelled stand.
  test('a red is pending while a newer round of its workflow has no run yet', () => {
    const red = {
      ...run('Validate commit messages', 'cancelled', 10, 100),
      round: { workflowId: 7, completed: true },
    } as const;

    const held = new Map<number, WorkflowRound>([
      [10, { workflowId: 7, completed: true }],
      [11, { workflowId: 7, completed: false }],
    ]);

    assert.strictEqual(
      statesFromCheckRuns([red], NOW, held).get('Validate commit messages'),
      'pending',
    );

    assert.isTrue(anyRunInProgress([red], held));

    // Once it has finished without a run of that name, the red stands.
    const finished = new Map<number, WorkflowRound>([
      [11, { workflowId: 7, completed: true }],
    ]);

    assert.strictEqual(
      statesFromCheckRuns([red], NOW, finished).get('Validate commit messages'),
      'failed',
    );

    assert.isFalse(anyRunInProgress([red], finished));
  });

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

    assert.strictEqual(states.get('code-check-result / result'), 'passed');
  });

  test('a stale red in a later suite still holds the merge', () => {
    // `test-node-versions-result`, the one context of the five that blocked
    // #2021: the cancelled suite happens to have the greater id, so GitHub
    // reports the failure however much later the green one finished. Reading
    // the newest `started_at` instead would call this pull request green while
    // GitHub blocks it.
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

    assert.strictEqual(
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

    assert.strictEqual(forwards.get('style-check-result / result'), 'passed');

    assert.strictEqual(backwards.get('style-check-result / result'), 'passed');
  });

  test('a re-run inside one suite is told apart by its id', () => {
    const states = statesFromCheckRuns([
      run('code-check (check:knip)', 'failure', 96_234_480_526, 1),
      run('code-check (check:knip)', 'success', 96_234_480_526, 2),
    ]);

    assert.strictEqual(states.get('code-check (check:knip)'), 'passed');
  });

  test('a name reported once is left as it is', () => {
    const states = statesFromCheckRuns([
      run('coverage-main', 'skipped', 96_234_480_526, 106_166_639_842),
    ]);

    assert.strictEqual(states.get('coverage-main'), 'skipped');
  });
});

describe(outranks, () => {
  test('ranks a later suite first, whatever the run ids', () => {
    assert.isTrue(
      outranks({ checkSuiteId: 2, id: 1 }, { checkSuiteId: 1, id: 9 }),
    );

    assert.isFalse(
      outranks({ checkSuiteId: 1, id: 9 }, { checkSuiteId: 2, id: 1 }),
    );
  });

  test('ranks a re-run, a later run in the same suite, over the run before', () => {
    assert.isTrue(
      outranks({ checkSuiteId: 1, id: 11 }, { checkSuiteId: 1, id: 10 }),
    );

    assert.isFalse(
      outranks({ checkSuiteId: 1, id: 10 }, { checkSuiteId: 1, id: 10 }),
    );
  });
});

describe(combineContextStates, () => {
  test('a red check run is not covered by a green status of the same name', () => {
    // GitHub: "If a check and a commit status have the same name, both must
    // pass when that name is required."
    assert.strictEqual(combineContextStates('failed', 'passed'), 'failed');

    assert.strictEqual(combineContextStates('passed', 'failed'), 'failed');
  });

  test('one still running holds the pair', () => {
    assert.strictEqual(combineContextStates('passed', 'pending'), 'pending');

    assert.strictEqual(combineContextStates('failed', 'pending'), 'failed');
  });

  test('both green is green', () => {
    assert.strictEqual(combineContextStates('passed', 'passed'), 'passed');
  });

  test('a skip beside a pass is still said to be a skip', () => {
    // Both count as met, so neither holds the pair; but "passed" would claim
    // that something ran and went green, which of the two only one did.
    assert.strictEqual(combineContextStates('skipped', 'passed'), 'skipped');

    assert.strictEqual(combineContextStates('passed', 'skipped'), 'skipped');

    assert.strictEqual(combineContextStates('skipped', 'pending'), 'pending');

    assert.strictEqual(combineContextStates('skipped', 'failed'), 'failed');
  });
});

describe(reportedContexts, () => {
  test('reads check runs and commit statuses together', () => {
    assert.deepStrictEqual(
      reportedContexts(
        [completedRun('code-check-result / result', 'success')],
        [{ context: 'no-skip-ci-label', state: 'pending' }],
      ),
      new Map<string, ContextState>([
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
      new Map<string, ContextState>([['lint', 'failed']]),
    );

    assert.deepStrictEqual(
      reportedContexts(
        [completedRun('lint', 'success')],
        [{ context: 'lint', state: 'pending' }],
      ),
      new Map<string, ContextState>([['lint', 'pending']]),
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
    round: undefined,
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
          round: undefined,
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

  test('reads only the latest round of each workflow', () => {
    const stuck = {
      name: 'code-check-result / result',
      status: 'queued',
      conclusion: undefined,
      checkSuiteId: 1,
      id: 1,
      round: { workflowId: 7, completed: false },
    } as const;

    const green = {
      name: 'code-check-result / result',
      status: 'completed',
      conclusion: 'success',
      checkSuiteId: 2,
      id: 2,
      round: { workflowId: 7, completed: true },
    } as const;

    assert.isFalse(anyRunInProgress([stuck, green]));

    assert.isTrue(
      anyRunInProgress([
        stuck,
        { ...green, round: { workflowId: 8, completed: true } },
      ]),
    );
  });

  // Every run is read (`filter=all`): a run of an older suite GitHub never
  // closed is superseded by the later suite's, and holds nothing.
  test('reads only the run of each name that counts', () => {
    assert.isFalse(
      anyRunInProgress([
        {
          name: 'code-check-result / result',
          status: 'queued',
          conclusion: undefined,
          checkSuiteId: 1,
          id: 1,
          round: undefined,
        },
        {
          name: 'code-check-result / result',
          status: 'completed',
          conclusion: 'success',
          checkSuiteId: 2,
          id: 2,
          round: undefined,
        },
      ]),
    );
  });
});

/**
 * The state #2031 was in when the page showed it a tick.
 *
 * `skip-ci` came off, which started a new round. The old round's
 * `code-check-result` had concluded `skipped` and was the only run of that name
 * on the commit — the new round's aggregate does not exist until the jobs it
 * waits on are done. Folding `skipped` into `passed` then made the pull request
 * look settled and green, two minutes before `code-check-result` concluded
 * `failure`.
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
      round: undefined,
    },
    {
      id: 2,
      checkSuiteId: 96_510_173_749,
      name: 'style-check-result / result',
      status: 'completed',
      conclusion: 'skipped',
      round: undefined,
    },
    // The round that replaced it, still going: its aggregates have not been
    // created yet, only the jobs they wait on.
    {
      id: 3,
      checkSuiteId: 96_511_684_948,
      name: 'code-check (ws:fix:lint)',
      status: 'in_progress',
      conclusion: undefined,
      round: undefined,
    },
  ] as const;

  test('reads a skip as a skip rather than as a pass', () => {
    assert.strictEqual(
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
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'pending');

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
          round: undefined,
        },
        {
          id: 5,
          checkSuiteId: 96_511_684_934,
          name: 'style-check-result / result',
          status: 'completed',
          conclusion: 'success',
          round: undefined,
        },
      ]),
      paused: false,
      running: false,
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'failing');

    assert.deepStrictEqual(summary.failed, ['code-check-result / result']);

    assert.deepStrictEqual(summary.passed, ['style-check-result / result']);
  });
});

/**
 * The state #2191 was in when the page called it failing.
 *
 * `skip-ci` came off, which started a round, and `merge-queued` went on a
 * minute later, which started another and cancelled the first — whose
 * `*-result` aggregates, `if: always()` over cancelled `needs`, concluded
 * `failure`. The newer round was still at its matrix, so its aggregates did not
 * exist yet, and the red of the cancelled one was the only run of each name on
 * the commit.
 */
describe('a required context whose workflow has a newer round running', () => {
  const codeCheck = 359_266_435;

  const styleCheck = 331_119_616;

  const strictLibGen = 357_169_060;

  const required = [
    'code-check-result / result',
    'style-check-result / result',
    'strict-lib-gen-result / result',
  ] as const;

  const runs = [
    // The round `merge-queued` cancelled.
    {
      id: 114_375_454_394,
      checkSuiteId: 103_247_630_670,
      name: 'code-check-result / result',
      status: 'completed',
      conclusion: 'failure',
      round: { workflowId: codeCheck, completed: true },
    },
    {
      id: 114_375_454_946,
      checkSuiteId: 103_247_630_878,
      name: 'style-check-result / result',
      status: 'completed',
      conclusion: 'failure',
      round: { workflowId: styleCheck, completed: true },
    },
    {
      id: 114_375_425_586,
      checkSuiteId: 103_247_631_174,
      name: 'strict-lib-gen-result / result',
      status: 'completed',
      conclusion: 'failure',
      round: { workflowId: strictLibGen, completed: true },
    },
    // The round that cancelled it. Code Check is still at its matrix.
    {
      id: 114_375_942_843,
      checkSuiteId: 103_247_840_668,
      name: 'code-check (ws:fix:lint)',
      status: 'in_progress',
      conclusion: undefined,
      round: { workflowId: codeCheck, completed: false },
    },
    // Style Check has finished every job it has created, but the round is not
    // over: its aggregate is created only after that.
    {
      id: 114_375_644_790,
      checkSuiteId: 103_247_840_622,
      name: 'style-check (ws:gen)',
      status: 'completed',
      conclusion: 'success',
      round: { workflowId: styleCheck, completed: false },
    },
    // Strict Lib Generation has finished and answered for itself.
    {
      id: 114_375_967_721,
      checkSuiteId: 103_247_840_662,
      name: 'strict-lib-gen-result / result',
      status: 'completed',
      conclusion: 'success',
      round: { workflowId: strictLibGen, completed: true },
    },
  ] as const;

  test('reads the context as pending until the newer round answers it', () => {
    const states = statesFromCheckRuns(runs);

    assert.strictEqual(states.get('code-check-result / result'), 'pending');

    assert.strictEqual(states.get('style-check-result / result'), 'pending');

    assert.strictEqual(states.get('strict-lib-gen-result / result'), 'passed');
  });

  // The regression: this said `failing`.
  test('does not call the pull request failing', () => {
    const summary = summarizeChecks({
      required,
      reported: statesFromCheckRuns(runs),
      paused: false,
      running: anyRunInProgress(runs),
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'pending');

    assert.deepStrictEqual(summary.failed, []);

    assert.deepStrictEqual(summary.pending, [
      'code-check-result / result',
      'style-check-result / result',
    ]);
  });

  test('a round with every job it has created finished is still running', () => {
    assert.isTrue(
      anyRunInProgress(
        runs.filter(({ name }) => name !== 'code-check (ws:fix:lint)'),
      ),
    );
  });

  // The rule is not "an older round never counts": where the newer round
  // finished without a run of that name, GitHub answers with the older run, and
  // so does this.
  test('a finished round that never ran the job does not hide the older run', () => {
    const states = statesFromCheckRuns([
      runs[0],
      {
        id: 114_375_942_843,
        checkSuiteId: 103_247_840_668,
        name: 'code-check (ws:fix:lint)',
        status: 'completed',
        conclusion: 'success',
        round: { workflowId: codeCheck, completed: true },
      },
    ]);

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });

  // Nor "the round still running wins": GitHub resolves a context to the suite
  // with the greatest id, and where the cancelled one has it, its red holds the
  // merge however the other round goes.
  test('a cancelled round with the greater id still holds the merge', () => {
    const states = statesFromCheckRuns([
      {
        ...runs[0],
        checkSuiteId: 103_247_840_669,
      },
      runs[3],
    ]);

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });

  test('a round of another workflow does not hold the context', () => {
    const states = statesFromCheckRuns([
      runs[0],
      {
        ...runs[3],
        round: { workflowId: styleCheck, completed: false },
      },
    ]);

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });
});

// #3474: "Re-run failed jobs" keeps the workflow run, and so its check suite,
// and starts a new attempt of it. The aggregate of the attempt before stays red
// until the re-run jobs it needs are done and it runs again.
describe('a required context whose own workflow run is being re-run', () => {
  const codeCheck = 359_266_435;

  const attemptStartedAt = '2026-11-07T10:30:00Z';

  const nowMs = Date.parse('2026-11-07T10:40:00Z');

  const reRunning = {
    workflowId: codeCheck,
    completed: false,
    attemptStartedAt,
  } as const;

  const red = {
    id: 11,
    checkSuiteId: 1,
    name: 'code-check-result / result',
    status: 'completed',
    conclusion: 'failure',
    completedAt: '2026-11-07T10:00:00Z',
    round: reRunning,
  } as const;

  const queuedJob = {
    id: 12,
    checkSuiteId: 1,
    name: 'code-check (ws:fix:lint)',
    status: 'queued',
    conclusion: undefined,
    round: reRunning,
  } as const;

  test('reads the red of the attempt before as pending', () => {
    const states = statesFromCheckRuns([red, queuedJob], nowMs);

    assert.strictEqual(states.get('code-check-result / result'), 'pending');
  });

  test('does not call the pull request failing', () => {
    const summary = summarizeChecks({
      required: ['code-check-result / result'],
      reported: statesFromCheckRuns([red, queuedJob], nowMs),
      paused: false,
      running: anyRunInProgress([red, queuedJob]),
      baseCovered: true,
    });

    assert.strictEqual(summary.verdict, 'pending');
  });

  test('holds the red in the gap after the re-run jobs finish, before the aggregate runs again', () => {
    const states = statesFromCheckRuns(
      [
        red,
        {
          ...queuedJob,
          status: 'completed',
          conclusion: 'success',
          completedAt: '2026-11-07T10:38:00Z',
        },
      ],
      nowMs,
    );

    assert.strictEqual(states.get('code-check-result / result'), 'pending');
  });

  test('a green of the attempt before stands for its context', () => {
    const states = statesFromCheckRuns(
      [{ ...red, name: 'lint', conclusion: 'success' }],
      nowMs,
    );

    assert.strictEqual(states.get('lint'), 'passed');
  });

  test('a red reached in the attempt still running fails at once', () => {
    const states = statesFromCheckRuns(
      [{ ...red, completedAt: '2026-11-07T10:35:00Z' }],
      nowMs,
    );

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });

  test('the red stands once the workflow run has finished', () => {
    const states = statesFromCheckRuns(
      [{ ...red, round: { ...reRunning, completed: true } }],
      nowMs,
    );

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });

  test('the red stands when the attempt has gone on past the grace period', () => {
    const states = statesFromCheckRuns(
      [red],
      Date.parse(attemptStartedAt) + RE_RUN_GRACE_MS + 1,
    );

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });

  test('the red stands when the start of the attempt was not read', () => {
    const states = statesFromCheckRuns(
      [{ ...red, round: { workflowId: codeCheck, completed: false } }],
      nowMs,
    );

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });

  test('the red stands when when it finished was not read', () => {
    const { completedAt: _, ...withoutCompletedAt } = red;

    const states = statesFromCheckRuns([withoutCompletedAt], nowMs);

    assert.strictEqual(states.get('code-check-result / result'), 'failed');
  });
});

describe(isOfEarlierAttempt, () => {
  const round = {
    workflowId: 1,
    completed: false,
    attemptStartedAt: '2026-11-07T10:30:00Z',
  } as const;

  const nowMs = Date.parse('2026-11-07T10:40:00Z');

  test('is true of a run that finished before the attempt still going began', () => {
    assert.isTrue(isOfEarlierAttempt('2026-11-07T10:00:00Z', round, nowMs));
  });

  test('is false of a run of the attempt itself', () => {
    assert.isFalse(isOfEarlierAttempt('2026-11-07T10:31:00Z', round, nowMs));
  });

  test('is false with no round, or a finished one', () => {
    assert.isFalse(
      isOfEarlierAttempt('2026-11-07T10:00:00Z', undefined, nowMs),
    );

    assert.isFalse(
      isOfEarlierAttempt(
        '2026-11-07T10:00:00Z',
        { ...round, completed: true },
        nowMs,
      ),
    );
  });
});

const NOW = Date.parse('2026-11-08T04:56:08Z');

describe(workflowRunOf, () => {
  test('is the run of the suite the winning check run belongs to', () => {
    const checkRun = {
      name: 'gate',
      status: 'completed',
      conclusion: 'failure',
      id: 1,
      startedAt: undefined,
      completedAt: undefined,
      annotationTitles: undefined,
      url: '',
    } as const;

    const round = {
      workflowId: 1,
      completed: true,
      attemptStartedAt: undefined,
      ...ROUND_REST,
    } as const;

    const checks = {
      sha: 'a'.repeat(40),
      runs: [
        { ...checkRun, checkSuiteId: 10 },
        { ...checkRun, checkSuiteId: 11, id: 2 },
      ],
      statuses: [],
      rounds: [
        { ...round, checkSuiteId: 10, runId: 100 },
        { ...round, checkSuiteId: 11, runId: 110 },
      ],
    } as const;

    assert.strictEqual(workflowRunOf(checks, 'gate'), 110);

    assert.isTrue(workflowRunOf(checks, 'other') === undefined);
  });
});
