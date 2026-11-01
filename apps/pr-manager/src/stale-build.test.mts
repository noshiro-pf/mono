import { importOrReload, type StaleBuildDeps } from './stale-build.mjs';
import type { KeyValueStore } from './token.mjs';

const makeDeps = (
  storage: KeyValueStore | undefined,
): StaleBuildDeps &
  Readonly<{
    reloads: () => number;
    moveClock: (ms: number) => void;
  }> => {
  let mut_nowMs = 1_000_000;

  let mut_reloads = 0;

  return {
    now: () => mut_nowMs,
    storage,
    reload: () => {
      mut_reloads += 1;
    },
    reloads: () => mut_reloads,
    moveClock: (ms) => {
      mut_nowMs += ms;
    },
  };
};

const memoryStore = (): KeyValueStore => {
  const mut_items = new Map<string, string>();

  return {
    getItem: (key) => mut_items.get(key) ?? null,
    setItem: (key, value) => {
      mut_items.set(key, value);
    },
    removeItem: (key) => {
      mut_items.delete(key);
    },
  };
};

const loaded = (): Promise<string> => Promise.resolve('module');

const missingChunk = (): Promise<never> =>
  Promise.reject(new TypeError('Importing a module script failed.'));

describe(importOrReload, () => {
  test('hands back what the import gave, and reloads nothing', async () => {
    const deps = makeDeps(memoryStore());

    await expect(importOrReload(loaded, deps)).resolves.toBe('module');

    expect(deps.reloads()).toBe(0);
  });

  test('reloads the page when the import fails', async () => {
    const deps = makeDeps(memoryStore());

    await expect(importOrReload(missingChunk, deps)).resolves.toBeUndefined();

    expect(deps.reloads()).toBe(1);
  });

  test('does not reload again right after a reload it made', async () => {
    const deps = makeDeps(memoryStore());

    await importOrReload(missingChunk, deps);

    deps.moveClock(5000);

    await expect(importOrReload(missingChunk, deps)).rejects.toThrow(
      'Importing a module script failed.',
    );

    expect(deps.reloads()).toBe(1);
  });

  test('reloads again when the last reload was a while ago', async () => {
    const deps = makeDeps(memoryStore());

    await importOrReload(missingChunk, deps);

    deps.moveClock(120_000);

    await expect(importOrReload(missingChunk, deps)).resolves.toBeUndefined();

    expect(deps.reloads()).toBe(2);
  });

  test('holds back for a minute after a reload, and no longer', async () => {
    const deps = makeDeps(memoryStore());

    await importOrReload(missingChunk, deps);

    deps.moveClock(59_999);

    await expect(importOrReload(missingChunk, deps)).rejects.toThrow(
      'Importing a module script failed.',
    );

    deps.moveClock(1);

    await expect(importOrReload(missingChunk, deps)).resolves.toBeUndefined();

    expect(deps.reloads()).toBe(2);
  });

  test('reloads again after an import that succeeded in between', async () => {
    const deps = makeDeps(memoryStore());

    await importOrReload(missingChunk, deps);

    await importOrReload(loaded, deps);

    await importOrReload(missingChunk, deps);

    expect(deps.reloads()).toBe(2);
  });

  test('reloads when the last reload is noted later than now', async () => {
    // The clock was put back since.
    const deps = makeDeps(memoryStore());

    await importOrReload(missingChunk, deps);

    deps.moveClock(-600_000);

    await importOrReload(missingChunk, deps);

    expect(deps.reloads()).toBe(2);
  });

  test('reloads when what is noted is not a time', async () => {
    const deps = makeDeps({
      ...memoryStore(),
      getItem: () => 'garbage',
    });

    await importOrReload(missingChunk, deps);

    expect(deps.reloads()).toBe(1);
  });

  test('does not reload without a storage to note it in', async () => {
    // Nothing would then stop a page whose import always fails from reloading
    // itself for ever.
    const deps = makeDeps(undefined);

    await expect(importOrReload(missingChunk, deps)).rejects.toThrow(
      'Importing a module script failed.',
    );

    expect(deps.reloads()).toBe(0);
  });

  test('does not reload where the storage refuses to be written', async () => {
    const deps = makeDeps({
      ...memoryStore(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });

    await expect(importOrReload(missingChunk, deps)).rejects.toThrow(
      'Importing a module script failed.',
    );

    expect(deps.reloads()).toBe(0);
  });

  test('does not reload where the storage refuses to be read', async () => {
    const deps = makeDeps({
      ...memoryStore(),
      getItem: () => {
        throw new Error('SecurityError');
      },
    });

    await expect(importOrReload(missingChunk, deps)).rejects.toThrow(
      'Importing a module script failed.',
    );

    expect(deps.reloads()).toBe(0);
  });
});
