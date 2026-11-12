import {
  compareEntries,
  recoverFromStaleBuild,
  reloadForStaleBuild,
  type BuildCheck,
  type KeyValueStore,
  type RecoveryDeps,
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

describe(compareEntries, () => {
  test('tells a build the site serves from the one running', () => {
    assert.strictEqual(
      compareEntries(
        'https://x.test/mono/app/assets/index-a.js',
        'https://x.test/mono/app/assets/index-b.js',
      ),
      'changed',
    );

    assert.strictEqual(
      compareEntries(
        'https://x.test/mono/app/assets/index-a.js',
        'https://x.test/mono/app/assets/index-a.js',
      ),
      'unchanged',
    );
  });

  test('cannot tell without both entry scripts', () => {
    assert.strictEqual(
      compareEntries(undefined, 'https://x.test/assets/index-b.js'),
      'unknown',
    );

    assert.strictEqual(
      compareEntries('https://x.test/assets/index-a.js', undefined),
      'unknown',
    );
  });
});

/**
 * Recovery deps whose build check answers `checks` in turn, and whose wait for
 * the network resolves at once, counted.
 */
const recoveryDeps = (
  checks: readonly BuildCheck[],
  overrides: Partial<RecoveryDeps> = {},
): RecoveryDeps &
  Readonly<{
    reloads: () => number;
    checksMade: () => number;
    waits: () => number;
  }> => {
  const base = makeDeps(memoryStore());

  let mut_checksMade = 0;

  let mut_waits = 0;

  return {
    ...base,
    leaving: () => false,
    online: () => true,
    checkBuild: () => {
      const check = checks[mut_checksMade] ?? 'unknown';

      mut_checksMade += 1;

      return Promise.resolve(check);
    },
    waitForOnline: () => {
      mut_waits += 1;

      return Promise.resolve();
    },
    checksMade: () => mut_checksMade,
    waits: () => mut_waits,
    ...overrides,
  };
};

describe(recoverFromStaleBuild, () => {
  test('reloads when the site serves another build than the one running', async () => {
    const deps = recoveryDeps(['changed']);

    assert.isTrue(await recoverFromStaleBuild(deps));

    expect(deps.reloads()).toBe(1);
  });

  test('does not reload for a failure of the build that is still served', async () => {
    // A module that throws while evaluated, or a passing network failure: a
    // reload would only lose what the reader had on the page.
    const deps = recoveryDeps(['unchanged']);

    assert.isFalse(await recoverFromStaleBuild(deps));

    expect(deps.reloads()).toBe(0);
  });

  test('does not reload when it cannot tell which build is served', async () => {
    const deps = recoveryDeps(['unknown']);

    assert.isFalse(await recoverFromStaleBuild(deps));

    expect(deps.reloads()).toBe(0);
  });

  test('waits for the network while offline, then checks and reloads', async () => {
    let mut_online = false;

    const deps = recoveryDeps(['changed'], {
      online: () => mut_online,
      waitForOnline: () => {
        mut_online = true;

        return Promise.resolve();
      },
    });

    assert.isTrue(await recoverFromStaleBuild(deps));

    expect(deps.checksMade()).toBe(1);

    expect(deps.reloads()).toBe(1);
  });

  test('waits for the network when the site cannot be reached, then checks again', async () => {
    const deps = recoveryDeps(['unreachable', 'changed']);

    assert.isTrue(await recoverFromStaleBuild(deps));

    expect(deps.waits()).toBe(1);

    expect(deps.checksMade()).toBe(2);

    expect(deps.reloads()).toBe(1);
  });

  test('does nothing once the reader is leaving the page', async () => {
    // A browser rejects the imports pending when the page is left, which would
    // otherwise reload over the navigation the reader started.
    const deps = recoveryDeps(['changed'], { leaving: () => true });

    assert.isFalse(await recoverFromStaleBuild(deps));

    expect(deps.checksMade()).toBe(0);

    expect(deps.reloads()).toBe(0);
  });

  test('does not reload when the reader starts leaving during the check', async () => {
    let mut_leaving = false;

    const deps = recoveryDeps([], {
      leaving: () => mut_leaving,
      checkBuild: () => {
        mut_leaving = true;

        return Promise.resolve('changed');
      },
    });

    assert.isFalse(await recoverFromStaleBuild(deps));

    expect(deps.reloads()).toBe(0);
  });
});
