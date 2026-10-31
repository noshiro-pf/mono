import type { LoadedReport } from './load-report.mjs';
import { createReportCache, reportCacheKey } from './report-cache.mjs';

describe(createReportCache, () => {
  test('hands back what the same build kept for the same token', async () => {
    const { cacheOf } = setup();

    const cache = cacheOf('build-1');

    cache.save(REPORT, 'token');

    await settle();

    assert.deepStrictEqual(await cache.load('token'), REPORT);
  });

  test('reads nothing another build kept', async () => {
    const { cacheOf } = setup();

    cacheOf('build-1').save(REPORT, 'token');

    await settle();

    assert.isUndefined(await cacheOf('build-2').load('token'));
  });

  test('reads nothing kept for another token, and keeps no token itself', async () => {
    const { cacheOf, kept } = setup();

    const cache = cacheOf('build-1');

    cache.save(REPORT, 'secret-token');

    await settle();

    assert.isUndefined(await cache.load('another-token'));

    assert.deepStrictEqual(await cache.load('secret-token'), REPORT);

    assert.notInclude(JSON.stringify(kept()), 'secret-token');
  });

  test('reads nothing once cleared, or where nothing was kept', async () => {
    const { cacheOf } = setup();

    const cache = cacheOf('build-1');

    assert.isUndefined(await cache.load('token'));

    cache.save(REPORT, 'token');

    await settle();

    cache.clear();

    await settle();

    assert.isUndefined(await cache.load('token'));
  });

  test('keeps nothing, and fails nothing, where IndexedDB refuses', async () => {
    const cache = createReportCache({
      source: SOURCE,
      build: 'build-1',
      read: () => Promise.reject(new Error('no IndexedDB')),
      write: () => Promise.reject(new Error('no IndexedDB')),
    });

    cache.save(REPORT, 'token');

    cache.clear();

    await settle();

    assert.isUndefined(await cache.load('token'));
  });

  test('keeps one report per repository, whatever the case of its name', () => {
    assert.strictEqual(
      reportCacheKey({ owner: 'Noshiro-PF', repo: 'Mono' }),
      reportCacheKey(SOURCE),
    );

    assert.notStrictEqual(
      reportCacheKey({ owner: 'noshiro-pf', repo: 'other' }),
      reportCacheKey(SOURCE),
    );
  });
});

const SOURCE = { owner: 'noshiro-pf', repo: 'mono' } as const;

const REPORT: LoadedReport = {
  repo: { owner: 'noshiro-pf', name: 'mono' },
  readAtEpochMs: 1_000,
  required: [],
  features: { requiredChecks: true, codeOwnerReview: true, queue: true },
  summary: {
    open: 0,
    queued: 0,
    draft: 0,
    failing: 0,
    setAside: 0,
    awaitingReview: 0,
    pending: 0,
  },
  entries: [],
  roots: [],
  cycles: [],
  merged: [],
  issues: { items: [], totalCount: 0, endCursor: undefined, referenced: [] },
  queue: undefined,
  reading: [],
} as const;

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

/** Caches of any build over one database, as two deploys of the page share it. */
const setup = (): Readonly<{
  cacheOf: (build: string) => ReturnType<typeof createReportCache>;
  /** What is kept for {@link SOURCE}, as the database holds it. */
  kept: () => unknown;
}> => {
  const mut_database = new Map<string, unknown>();

  return {
    cacheOf: (build) =>
      createReportCache({
        source: SOURCE,
        build,
        read: (key) => Promise.resolve(mut_database.get(key)),
        write: (key, value) => {
          mut_database.set(key, value);

          return Promise.resolve();
        },
      }),
    kept: () => mut_database.get(reportCacheKey(SOURCE)),
  };
};
