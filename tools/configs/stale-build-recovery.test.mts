import {
  reloadForStaleBuild,
  type KeyValueStore,
  type StaleBuildDeps,
} from './stale-build-recovery.mjs';

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
    online: () => true,
    storage,
    storageKey: 'stale-build-reloaded-at:/mono/app/',
    reload: () => {
      mut_reloads += 1;
    },
    reloads: () => mut_reloads,
    moveClock: (ms) => {
      mut_nowMs += ms;
    },
  };
};

const memoryStore = (): KeyValueStore &
  Readonly<{ keys: () => readonly string[] }> => {
  const mut_items = new Map<string, string>();

  return {
    getItem: (key) => mut_items.get(key) ?? null,
    setItem: (key, value) => {
      mut_items.set(key, value);
    },
    keys: () => Array.from(mut_items.keys()),
  };
};

describe(reloadForStaleBuild, () => {
  test('reloads the page', () => {
    const deps = makeDeps(memoryStore());

    assert.isTrue(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(1);
  });

  test('notes the reload under the key it is given', () => {
    const storage = memoryStore();

    reloadForStaleBuild(makeDeps(storage));

    assert.deepStrictEqual(storage.keys(), [
      'stale-build-reloaded-at:/mono/app/',
    ]);
  });

  test('does not reload again right after a reload it made', () => {
    const deps = makeDeps(memoryStore());

    reloadForStaleBuild(deps);

    deps.moveClock(5000);

    assert.isFalse(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(1);
  });

  test('holds back for a minute after a reload, and no longer', () => {
    const deps = makeDeps(memoryStore());

    reloadForStaleBuild(deps);

    deps.moveClock(59_999);

    assert.isFalse(reloadForStaleBuild(deps));

    deps.moveClock(1);

    assert.isTrue(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(2);
  });

  test('is not held back by a reload another app on the site made', () => {
    // Every Pages app shares the one origin, and so one `sessionStorage`.
    const storage = memoryStore();

    reloadForStaleBuild(makeDeps(storage));

    const other = {
      ...makeDeps(storage),
      storageKey: 'stale-build-reloaded-at:/mono/other/',
    } as const;

    assert.isTrue(reloadForStaleBuild(other));
  });

  test('reloads when the last reload is noted later than now', () => {
    // The clock was put back since.
    const deps = makeDeps(memoryStore());

    reloadForStaleBuild(deps);

    deps.moveClock(-600_000);

    assert.isTrue(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(2);
  });

  test('reloads when what is noted is not a time', () => {
    const deps = makeDeps({
      ...memoryStore(),
      getItem: () => 'garbage',
    });

    assert.isTrue(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(1);
  });

  test('does not reload while the browser is offline', () => {
    // The chunk is then not gone but out of reach, and a reload would trade the
    // page for the browser's offline error.
    const storage = memoryStore();

    const deps = { ...makeDeps(storage), online: () => false } as const;

    assert.isFalse(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(0);

    assert.deepStrictEqual(storage.keys(), []);
  });

  test('does not reload without a storage to note it in', () => {
    // Nothing would then stop a page whose import always fails from reloading
    // itself for ever.
    const deps = makeDeps(undefined);

    assert.isFalse(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(0);
  });

  test('does not reload where the storage refuses to be written', () => {
    const deps = makeDeps({
      ...memoryStore(),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });

    assert.isFalse(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(0);
  });

  test('does not reload where the storage refuses to be read', () => {
    const deps = makeDeps({
      ...memoryStore(),
      getItem: () => {
        throw new Error('SecurityError');
      },
    });

    assert.isFalse(reloadForStaleBuild(deps));

    expect(deps.reloads()).toBe(0);
  });
});
