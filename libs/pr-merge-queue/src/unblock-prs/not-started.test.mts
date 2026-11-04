import { CHECKS_NOT_STARTED_GRACE_MS } from './constants.mjs';
import { nothingStarted, observeNotStarted } from './not-started.mjs';
import type { ChecksSummary } from './types.mjs';

const T0 = 1_000_000;

const summary = (overrides: Partial<ChecksSummary>): ChecksSummary =>
  ({
    verdict: 'pending',
    passed: [],
    failed: [],
    failedRuns: [],
    pending: [],
    skipped: [],
    missing: [],
    notRun: [],
    running: [],
    required: 9,
    ...overrides,
  }) as const;

const RESULTS = [
  'code-check-result / result',
  'style-check-result / result',
] as const;

// What #3263's head carried for two hours: the lint jobs and `no-skip-ci-label`
// from `pull_request_target`, and not one run of a check workflow.
const neverStarted = summary({
  passed: ['no-skip-ci-label', 'Validate PR title'],
  missing: RESULTS,
});

describe(nothingStarted, () => {
  test('holds when required contexts are missing and nothing runs', () => {
    assert.isTrue(nothingStarted(neverStarted));
  });

  test('does not hold while a check runs on the head', () => {
    assert.isFalse(
      nothingStarted({ ...neverStarted, running: ['gates / check'] }),
    );
  });

  test('does not hold while a required context is pending', () => {
    assert.isFalse(
      nothingStarted({
        ...neverStarted,
        pending: ['code-check-result / result'],
        missing: ['style-check-result / result'],
      }),
    );
  });

  // Every required context has reported, so a round ran, whatever it said.
  test('does not hold when nothing is missing', () => {
    assert.isFalse(nothingStarted({ ...neverStarted, missing: [] }));
  });

  test('does not hold for a verdict already reached', () => {
    assert.isFalse(nothingStarted({ ...neverStarted, verdict: 'failing' }));
  });
});

describe(observeNotStarted, () => {
  const fresh = { sinceEpochMs: undefined, refired: false } as const;

  test('starts the clock at the first poll that sees nothing started', () => {
    assert.deepStrictEqual(observeNotStarted(fresh, neverStarted, T0), {
      wait: { sinceEpochMs: T0, refired: false },
      action: 'wait',
    });
  });

  test('keeps the clock while the grace has not run out', () => {
    assert.deepStrictEqual(
      observeNotStarted(
        { sinceEpochMs: T0, refired: false },
        neverStarted,
        T0 + CHECKS_NOT_STARTED_GRACE_MS - 1,
      ),
      { wait: { sinceEpochMs: T0, refired: false }, action: 'wait' },
    );
  });

  // #3456: the set-aside clears only when `main` moves, which nothing may be
  // about to do, so GitHub is asked once more before it.
  test('re-fires the workflows once the first grace has run out, and starts the wait over', () => {
    assert.deepStrictEqual(
      observeNotStarted(
        { sinceEpochMs: T0, refired: false },
        neverStarted,
        T0 + CHECKS_NOT_STARTED_GRACE_MS,
      ),
      { wait: { sinceEpochMs: undefined, refired: true }, action: 'refire' },
    );
  });

  test('gives up once the grace after the re-fire has run out', () => {
    const afterRefire = T0 + CHECKS_NOT_STARTED_GRACE_MS;

    const started = observeNotStarted(
      { sinceEpochMs: undefined, refired: true },
      neverStarted,
      afterRefire,
    );

    assert.deepStrictEqual(started, {
      wait: { sinceEpochMs: afterRefire, refired: true },
      action: 'wait',
    });

    assert.deepStrictEqual(
      observeNotStarted(
        started.wait,
        neverStarted,
        afterRefire + CHECKS_NOT_STARTED_GRACE_MS,
      ),
      { wait: { sinceEpochMs: afterRefire, refired: true }, action: 'give-up' },
    );
  });

  // A round between two jobs can show nothing running for a poll; a run that
  // shows up at all is a round under way, and the wait starts over. The
  // re-fire is not given back: one per watch.
  test('stops the clock as soon as anything runs', () => {
    assert.deepStrictEqual(
      observeNotStarted(
        { sinceEpochMs: T0, refired: true },
        { ...neverStarted, running: ['gates / check'] },
        T0 + CHECKS_NOT_STARTED_GRACE_MS,
      ),
      { wait: { sinceEpochMs: undefined, refired: true }, action: 'wait' },
    );
  });
});
