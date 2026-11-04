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
  test('starts the clock at the first poll that sees nothing started', () => {
    assert.deepStrictEqual(observeNotStarted(undefined, neverStarted, T0), {
      sinceEpochMs: T0,
      gaveUp: false,
    });
  });

  test('keeps the clock while the grace has not run out', () => {
    assert.deepStrictEqual(
      observeNotStarted(T0, neverStarted, T0 + CHECKS_NOT_STARTED_GRACE_MS - 1),
      { sinceEpochMs: T0, gaveUp: false },
    );
  });

  test('gives up once the grace has run out', () => {
    assert.deepStrictEqual(
      observeNotStarted(T0, neverStarted, T0 + CHECKS_NOT_STARTED_GRACE_MS),
      { sinceEpochMs: T0, gaveUp: true },
    );
  });

  // A round between two jobs can show nothing running for a poll; a run that
  // shows up at all is a round under way, and the wait starts over.
  test('stops the clock as soon as anything runs', () => {
    assert.deepStrictEqual(
      observeNotStarted(
        T0,
        { ...neverStarted, running: ['gates / check'] },
        T0 + CHECKS_NOT_STARTED_GRACE_MS,
      ),
      { sinceEpochMs: undefined, gaveUp: false },
    );
  });
});
