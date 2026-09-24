import { Result } from 'ts-data-forge';
import { type RelaxedExtract } from 'ts-type-forge';
import { type LoadedReport } from './load-report.mjs';
import { asRefreshing, LOADING, merge, type LoadState } from './load-state.mjs';

describe(merge, () => {
  test('shows the first report, and the first failure', () => {
    assert.deepStrictEqual(
      merge(LOADING, Result.ok(readAt(10)), 10),
      ready(10),
    );

    assert.deepStrictEqual(merge(LOADING, Result.err('refused'), 10), {
      type: 'failed',
      message: 'refused',
    });
  });

  test('keeps the report on screen when a later read fails', () => {
    assert.deepStrictEqual(
      merge(asRefreshing(ready(10)), Result.err('rate limit spent'), 20),
      { ...ready(10), pollError: 'rate limit spent' },
    );
  });

  test('clears the failure once a read succeeds again', () => {
    assert.deepStrictEqual(
      merge({ ...ready(10), pollError: 'refused' }, Result.ok(readAt(30)), 30),
      ready(30),
    );
  });

  test('never lets an older read replace a newer one', () => {
    const newer = ready(20);

    assert.strictEqual(merge(newer, Result.ok(readAt(10)), 10), newer);

    assert.strictEqual(merge(newer, Result.err('late failure'), 10), newer);
  });
});

const readAt = (readAtEpochMs: number): LoadedReport =>
  ({
    repo: { owner: 'noshiro-pf', name: 'mono' },
    readAtEpochMs,
    required: [],
    summary: {
      open: 0,
      queued: 0,
      draft: 0,
      failing: 0,
      behind: 0,
      setAside: 0,
      awaitingReview: 0,
    },
    entries: [],
    roots: [],
    cycles: [],
    merged: [],
  }) as const;

const ready = (
  readAtEpochMs: number,
): RelaxedExtract<LoadState, Readonly<{ type: 'ready' }>> =>
  ({
    type: 'ready',
    report: readAt(readAtEpochMs),
    pollError: undefined,
    refreshing: false,
  }) as const;
