import { decideCodemodScope, toRepositoryPath } from './codemod-affected.mjs';

const scripts = {
  'z:ts-codemod': 'pnpm run z:ts-codemod:cmd --transformer append-as-const',
  'z:ts-codemod:cmd': 'tsx ./libs/ts-codemod-cli/src/cmd/ts-codemod.mts',
  'fix:codemod:affected': 'tsx ./tools/scripts/cmd/codemod-affected.mts',
  'ws:build': 'tsx ./tools/scripts/cmd/ws-build-stages.mts',
} as const;

const inputDirs = ['libs/ts-codemod-cli', 'libs/ts-codemod-lib'] as const;

describe('decideCodemodScope', () => {
  test('runs over the diff when nothing that decides the output changed', () => {
    assert.deepStrictEqual(
      decideCodemodScope({
        changedFiles: ['apps/algo-app/src/main.mts', 'docs/notes.md'],
        inputDirs,
        baseScripts: scripts,
        headScripts: scripts,
      }),
      { full: false },
    );
  });

  test('runs in full when a package the codemod runs changed', () => {
    const scope = decideCodemodScope({
      changedFiles: [
        'apps/algo-app/src/main.mts',
        'libs/ts-codemod-lib/src/functions/ast-transformers/append-as-const.mts',
      ],
      inputDirs,
      baseScripts: scripts,
      headScripts: scripts,
    });

    assert.isTrue(scope.full);

    assert.deepStrictEqual(scope.reasons, [
      'libs/ts-codemod-lib/src/functions/ast-transformers/append-as-const.mts is in libs/ts-codemod-lib, which the codemod runs.',
    ]);
  });

  test('does not take a sibling whose name starts with a package directory for it', () => {
    assert.deepStrictEqual(
      decideCodemodScope({
        changedFiles: ['libs/ts-codemod-lib-extra/src/index.mts'],
        inputDirs,
        baseScripts: scripts,
        headScripts: scripts,
      }),
      { full: false },
    );
  });

  test('runs in full when the lockfile, the tsx config or this command changed', () => {
    const scope = decideCodemodScope({
      changedFiles: [
        'pnpm-lock.yaml',
        'tools/configs/tsconfig.tsx.json',
        'tools/scripts/cmd/codemod-affected.mts',
      ],
      inputDirs,
      baseScripts: scripts,
      headScripts: scripts,
    });

    assert.isTrue(scope.full);

    assert.deepStrictEqual(scope.reasons, [
      'pnpm-lock.yaml changed, and it decides what the codemod does.',
      'tools/configs/tsconfig.tsx.json changed, and it decides what the codemod does.',
      'tools/scripts/cmd/codemod-affected.mts changed, and it decides what the codemod does.',
    ]);
  });

  test('runs in full when a script that says what the codemod does changed', () => {
    const scope = decideCodemodScope({
      changedFiles: ['package.json'],
      inputDirs,
      baseScripts: scripts,
      headScripts: {
        ...scripts,
        'z:ts-codemod': `${scripts['z:ts-codemod']} --transformer convert-to-readonly`,
      },
    });

    assert.isTrue(scope.full);

    assert.deepStrictEqual(scope.reasons, [
      'The root script z:ts-codemod changed.',
    ]);
  });

  test('ignores a change to another root script', () => {
    assert.deepStrictEqual(
      decideCodemodScope({
        changedFiles: ['package.json'],
        inputDirs,
        baseScripts: scripts,
        headScripts: { ...scripts, 'ws:build': 'echo build' },
      }),
      { full: false },
    );
  });

  test('runs in full when the base has no package.json to compare with', () => {
    const scope = decideCodemodScope({
      changedFiles: ['package.json'],
      inputDirs,
      baseScripts: undefined,
      headScripts: scripts,
    });

    assert.isTrue(scope.full);

    assert.deepStrictEqual(scope.reasons, [
      'The base has no root package.json scripts to compare with.',
    ]);
  });
});

describe('toRepositoryPath', () => {
  test('turns the absolute paths git helpers return into repository paths', () => {
    assert.strictEqual(
      toRepositoryPath(
        '/work/mono',
        '/work/mono/libs/ts-codemod-lib/src/a.mts',
      ),
      'libs/ts-codemod-lib/src/a.mts',
    );
  });

  test('keeps a path that is already relative to the repository', () => {
    assert.strictEqual(
      toRepositoryPath('/work/mono', 'libs/ts-codemod-lib/src/a.mts'),
      'libs/ts-codemod-lib/src/a.mts',
    );
  });
});
