import { Result } from 'ts-data-forge';
import { type LoadedReport } from './load-report.mjs';
import {
  asRefreshing,
  LOADING,
  READY,
  settle,
  type LoadStatus,
} from './load-state.mjs';

describe(settle, () => {
  test('shows the first report, and the first failure', () => {
    assert.deepStrictEqual(settle(LOADING, 0, Result.ok(readAt(10)), 10), {
      status: READY,
      report: readAt(10),
    });

    assert.deepStrictEqual(settle(LOADING, 0, Result.err('refused'), 10), {
      status: { type: 'failed', message: 'refused' },
      report: undefined,
    });
  });

  test('keeps the report on screen when a later read fails', () => {
    assert.deepStrictEqual(
      settle(asRefreshing(READY), 10, Result.err('rate limit spent'), 20),
      {
        status: {
          type: 'ready',
          pollError: 'rate limit spent',
          refreshing: false,
        },
        report: undefined,
      },
    );
  });

  test('clears the failure once a read succeeds again', () => {
    const failing: LoadStatus = {
      type: 'ready',
      pollError: 'refused',
      refreshing: false,
    } as const;

    assert.deepStrictEqual(settle(failing, 10, Result.ok(readAt(30)), 30), {
      status: READY,
      report: readAt(30),
    });
  });

  // What the reader writes is only what changed, and a read that brought a
  // report to a page with nothing else to say leaves the status as it was.
  test('hands back the status it was given when there is nothing new to say', () => {
    assert.strictEqual(
      settle(READY, 10, Result.ok(readAt(20)), 20).status,
      READY,
    );
  });

  test('never lets an older read replace a newer one', () => {
    assert.deepStrictEqual(settle(READY, 20, Result.ok(readAt(10)), 10), {
      status: READY,
      report: undefined,
    });

    assert.deepStrictEqual(settle(READY, 20, Result.err('late failure'), 10), {
      status: READY,
      report: undefined,
    });
  });
});

describe(asRefreshing, () => {
  test('marks a report as being read again, and leaves anything else', () => {
    assert.deepStrictEqual(asRefreshing(READY), {
      type: 'ready',
      pollError: undefined,
      refreshing: true,
    });

    assert.strictEqual(asRefreshing(LOADING), LOADING);
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
    issues: { items: [], totalCount: 0 },
  }) as const;
