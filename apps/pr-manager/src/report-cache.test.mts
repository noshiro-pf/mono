import { Arr, asUint32 } from 'ts-data-forge';
import type { LoadedReport } from './load-report.mjs';
import { createReportCache, reportCacheKey } from './report-cache.mjs';

describe(createReportCache, () => {
  test('hands back what the same build kept for the same token', async () => {
    const { cacheOf, written } = setup();

    const cache = cacheOf('build-1');

    await written(() => {
      cache.save(REPORT, 'token');
    });

    assert.deepStrictEqual(await cache.load('token'), REPORT);
  });

  test('reads nothing another build kept', async () => {
    const { cacheOf, written } = setup();

    await written(() => {
      cacheOf('build-1').save(REPORT, 'token');
    });

    assert.isUndefined(await cacheOf('build-2').load('token'));
  });

  test('reads nothing kept for another token, and keeps no token itself', async () => {
    const { cacheOf, kept, written } = setup();

    const cache = cacheOf('build-1');

    await written(() => {
      cache.save(REPORT, 'secret-token');
    });

    assert.isUndefined(await cache.load('another-token'));

    assert.deepStrictEqual(await cache.load('secret-token'), REPORT);

    assert.notInclude(JSON.stringify(kept()), 'secret-token');
  });

  test('reads nothing once cleared, or where nothing was kept', async () => {
    const { cacheOf, written } = setup();

    const cache = cacheOf('build-1');

    assert.isUndefined(await cache.load('token'));

    await written(() => {
      cache.save(REPORT, 'token');
    });

    await written(() => {
      cache.clear();
    });

    assert.isUndefined(await cache.load('token'));
  });

  test('keeps nothing, and fails nothing, where IndexedDB refuses', async () => {
    const { cacheOf, written } = setup({ refuse: true });

    const cache = cacheOf('build-1');

    await written(() => {
      cache.save(REPORT, 'token');

      cache.clear();
    }, 2);

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

/** What IndexedDB answers where the browser has none, or refuses it. */
const refused = (): Promise<never> => Promise.reject(new Error('no IndexedDB'));

/**
 * Caches of any build over one database, as two deploys of the page share it;
 * with `refuse`, a database that rejects every read and write, as a browser
 * with no IndexedDB does.
 */
const setup = (
  options?: Readonly<{ refuse?: boolean }>,
): Readonly<{
  cacheOf: (build: string) => ReturnType<typeof createReportCache>;
  /** What is kept for {@link SOURCE}, as the database holds it. */
  kept: () => unknown;
  /**
   * Runs `action` and settles once the database has taken (or, with `refuse`,
   * refused) the `count` writes it makes. `save` writes only after it hashes
   * the token, which Node does on its thread pool, so a timer cannot say when
   * that is; `clear` writes at once, so the wait is set up before `action` runs.
   */
  written: (action: () => void, count?: number) => Promise<void>;
}> => {
  const mut_database = new Map<string, unknown>();

  const mut_waiting: (() => void)[] = [];

  const refuse = options?.refuse === true;

  return {
    cacheOf: (build) =>
      createReportCache({
        source: SOURCE,
        build,
        read: (key) =>
          refuse ? refused() : Promise.resolve(mut_database.get(key)),
        write: (key, value) => {
          if (!refuse) {
            mut_database.set(key, value);
          }

          mut_waiting.shift()?.();

          return refuse ? refused() : Promise.resolve();
        },
      }),
    kept: () => mut_database.get(reportCacheKey(SOURCE)),
    written: async (action, count = 1) => {
      const taken = Promise.all(
        Arr.seq(asUint32(count)).map(
          async () =>
            new Promise<void>((resolve) => {
              mut_waiting.push(resolve);
            }),
        ),
      );

      action();

      await taken;
    },
  };
};
