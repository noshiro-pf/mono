import {
  findUnguardedScripts,
  findUnlistedGuardedScripts,
} from './check-deps-built-guard.mjs';

describe(findUnguardedScripts, () => {
  const guard = 'node ../../tools/scripts/cmd/assert-deps-built.mts';

  test('a script that starts with the guard passes', () => {
    assert.deepStrictEqual(
      findUnguardedScripts({
        scripts: { 'check:types': `${guard} && tsc --noEmit` },
        names: ['check:types'],
        guard,
      }),
      [],
    );
  });

  test('a script without the guard, or with it after the work, is reported', () => {
    assert.deepStrictEqual(
      findUnguardedScripts({
        scripts: {
          'check:types': 'tsc --noEmit',
          'check:test': `vitest run && ${guard}`,
        },
        names: ['check:types', 'check:test'],
        guard,
      }),
      ['check:types', 'check:test'],
    );
  });

  test('the guard at another depth does not count', () => {
    assert.deepStrictEqual(
      findUnguardedScripts({
        scripts: {
          'check:types':
            'node ../../../tools/scripts/cmd/assert-deps-built.mts && tsc --noEmit',
        },
        names: ['check:types'],
        guard,
      }),
      ['check:types'],
    );
  });

  test('a script the manifest does not define is not required', () => {
    assert.deepStrictEqual(
      findUnguardedScripts({
        scripts: { build: 'tsc' },
        names: ['check:types'],
        guard,
      }),
      [],
    );
  });
});

describe(findUnlistedGuardedScripts, () => {
  const guard = 'node ./tools/scripts/cmd/assert-deps-built.mts --workspace';

  test('a guarded script that is listed passes', () => {
    assert.deepStrictEqual(
      findUnlistedGuardedScripts({
        scripts: { 'ws:check:e2e': `${guard} && pnpm run -r check:e2e` },
        names: ['ws:check:e2e'],
        guard,
      }),
      [],
    );
  });

  test('a guarded script missing from the list is reported', () => {
    assert.deepStrictEqual(
      findUnlistedGuardedScripts({
        scripts: {
          'ws:check:e2e': `${guard} && pnpm run -r check:e2e`,
          'ws:check:e2e:emulators': `${guard} && pnpm run -r check:e2e:emulators`,
        },
        names: ['ws:check:e2e'],
        guard,
      }),
      ['ws:check:e2e:emulators'],
    );
  });

  test('a script without the guard, or with another form of it, is not required', () => {
    assert.deepStrictEqual(
      findUnlistedGuardedScripts({
        scripts: {
          build: 'tsc',
          'check:root:types':
            'node ./tools/scripts/cmd/assert-deps-built.mts && tsc --noEmit',
        },
        names: [],
        guard,
      }),
      [],
    );
  });
});
