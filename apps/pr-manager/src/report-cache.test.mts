import type { LoadedReport } from './load-report.mjs';
import { createReportCache, reportCacheKey } from './report-cache.mjs';

describe(createReportCache, () => {
  test('hands back what the same build kept for the same token', async () => {
    const { cacheOf, written } = setup();

    const cache = cacheOf('build-1');

    cache.save(REPORT, 'token');

    await written();

    assert.deepStrictEqual(await cache.load('token'), REPORT);
  });

  test('reads nothing another build kept', async () => {
    const { cacheOf, written } = setup();

    cacheOf('build-1').save(REPORT, 'token');

    await written();

    assert.isUndefined(await cacheOf('build-2').load('token'));
  });

  test('reads nothing kept for another token, and keeps no token itself', async () => {
    const { cacheOf, kept, written } = setup();

    const cache = cacheOf('build-1');

    cache.save(REPORT, 'secret-token');

    await written();

    assert.isUndefined(await cache.load('another-token'));

    assert.deepStrictEqual(await cache.load('secret-token'), REPORT);

    assert.notInclude(JSON.stringify(kept()), 'secret-token');
  });

  test('reads nothing once cleared, or where nothing was kept', async () => {
    const { cacheOf, written } = setup();

    const cache = cacheOf('build-1');

    assert.isUndefined(await cache.load('token'));

    cache.save(REPORT, 'token');

    await written();

    cache.clear();

    await written();

    assert.isUndefined(await cache.load('token'));
  });

  test('reads nothing once cleared, while a save called before it is still hashing its token', async () => {
    const { cacheOf, kept, writes, written } = setup();

    const hash = holdFirstHash();

    const cache = cacheOf('build-1', hash.fingerprint);

    cache.save(REPORT, 'token');

    cache.clear();

    hash.release();

    await written();

    await settle();

    assert.isUndefined(kept());

    assert.strictEqual(writes(), 1);

    assert.isUndefined(await cache.load('token'));
  });

  test('keeps only the later of two saves, whichever hashes its token first', async () => {
    const { cacheOf, writes, written } = setup();

    const hash = holdFirstHash();

    const cache = cacheOf('build-1', hash.fingerprint);

    cache.save(REPORT, 'token');

    cache.save(LATER_REPORT, 'token');

    await settle();

    hash.release();

    await written();

    await settle();

    assert.deepStrictEqual(await cache.load('token'), LATER_REPORT);

    assert.strictEqual(writes(), 1);
  });

  test('still clears after a write that failed', async () => {
    const cleared = Promise.withResolvers<unknown>();

    const mut_attempts = { count: 0 };

    const cache = createReportCache({
      source: SOURCE,
      build: 'build-1',
      fingerprint: (token) => Promise.resolve(`hash:${token}`),
      read: () => Promise.resolve(undefined),
      write: (_key, value) => {
        mut_attempts.count += 1;

        if (mut_attempts.count === 1) {
          return Promise.reject(new Error('quota exceeded'));
        }

        cleared.resolve(value);

        return Promise.resolve();
      },
    });

    cache.save(REPORT, 'token');

    await settle();

    cache.clear();

    assert.isUndefined(await cleared.promise);

    assert.strictEqual(mut_attempts.count, 2);
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

const LATER_REPORT: LoadedReport = { ...REPORT, readAtEpochMs: 2_000 } as const;

/**
 * A fingerprint whose first call is held open until `release`, as
 * `crypto.subtle.digest` may be for any time; every later call settles at once.
 */
const holdFirstHash = (): Readonly<{
  fingerprint: (token: string) => Promise<string | undefined>;
  release: () => void;
}> => {
  const held = Promise.withResolvers<undefined>();

  const mut_calls = { count: 0 };

  return {
    fingerprint: async (token) => {
      mut_calls.count += 1;

      if (mut_calls.count === 1) {
        await held.promise;
      }

      return `hash:${token}`;
    },
    release: () => {
      held.resolve(undefined);
    },
  };
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
};

/** Caches of any build over one database, as two deploys of the page share it. */
const setup = (): Readonly<{
  cacheOf: (
    build: string,
    fingerprint?: (token: string) => Promise<string | undefined>,
  ) => ReturnType<typeof createReportCache>;
  /** What is kept for {@link SOURCE}, as the database holds it. */
  kept: () => unknown;
  /** How many writes have reached the database. */
  writes: () => number;
  /**
   * Settles once the next write not yet waited for has reached the database.
   * `save` hashes the token first, which `crypto.subtle` may finish after any
   * timer, so waiting a tick is not enough.
   */
  written: () => Promise<void>;
}> => {
  const mut_database = new Map<string, unknown>();

  /** One promise per write, by its order, settled as that write lands. */
  const mut_writes: PromiseWithResolvers<undefined>[] = [];

  const mut_counts = { landed: 0, awaited: 0 };

  const nthWrite = (n: number): PromiseWithResolvers<undefined> =>
    (mut_writes[n] ??= Promise.withResolvers<undefined>());

  return {
    cacheOf: (build, fingerprint) =>
      createReportCache({
        source: SOURCE,
        build,
        ...(fingerprint === undefined ? {} : { fingerprint }),
        read: (key) => Promise.resolve(mut_database.get(key)),
        write: (key, value) => {
          mut_database.set(key, value);

          nthWrite(mut_counts.landed).resolve(undefined);

          mut_counts.landed += 1;

          return Promise.resolve();
        },
      }),
    kept: () => mut_database.get(reportCacheKey(SOURCE)),
    writes: () => mut_counts.landed,
    written: async () => {
      const n = mut_counts.awaited;

      mut_counts.awaited += 1;

      await nthWrite(n).promise;
    },
  };
};
