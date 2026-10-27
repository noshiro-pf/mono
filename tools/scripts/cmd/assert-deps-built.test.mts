import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as util from 'node:util';
import { isRecord, isString } from 'ts-data-forge';
import {
  entryPointTargets,
  findLinkedPackages,
  findMissingBuilds,
  formatMissingBuilds,
  workspaceStartDirs,
} from './assert-deps-built.mjs';

const scriptPath = fileURLToPath(
  new URL('assert-deps-built.mts', import.meta.url),
);

const execFileAsync = util.promisify(execFile);

describe(entryPointTargets, () => {
  test('collects every file an import can resolve to', () => {
    assert.deepStrictEqual(
      entryPointTargets({
        main: './dist/index.cjs',
        module: './dist/index.mjs',
        types: './dist/types.d.mts',
        exports: {
          '.': {
            import: {
              types: './dist/types.d.mts',
              default: './dist/entry-point.mjs',
            },
          },
          './package.json': './package.json',
        },
      }),
      [
        './dist/index.cjs',
        './dist/index.mjs',
        './dist/types.d.mts',
        './dist/entry-point.mjs',
        './package.json',
      ],
    );
  });

  test('accepts a string `exports`', () => {
    assert.deepStrictEqual(entryPointTargets({ exports: './src/index.mts' }), [
      './src/index.mts',
    ]);
  });

  test('skips subpath patterns and blocked subpaths', () => {
    assert.deepStrictEqual(
      entryPointTargets({
        exports: { './*': './dist/*.mjs', './internal': null },
      }),
      [],
    );
  });

  test('a manifest that exports nothing has nothing to check', () => {
    assert.deepStrictEqual(
      entryPointTargets({ name: 'app', private: true }),
      [],
    );
  });
});

const makeDirs = (root: string, dirs: readonly string[]): void => {
  for (const dir of dirs) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.join(root, dir), { recursive: true });
  }
};

const writeJson = (file: string, value: unknown): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(file, JSON.stringify(value));
};

const touch = (file: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(file, '');
};

const link = (from: string, to: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(path.dirname(from), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.symlinkSync(to, from, 'dir');
};

/**
 * A workspace laid out the way pnpm lays one out:
 *
 * - `app` depends on `lib` (devDependencies) and on a third-party `ext`.
 * - `lib` exports `dist/` and depends on `base`.
 * - `base` exports `dist/` too; `tooling` is only a devDependency of `lib`.
 * - `shared` exports its sources.
 */
const makeWorkspace = (): string => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'assert-deps-built-test-'),
  );

  makeDirs(root, ['node_modules/.pnpm/ext@1.0.0/node_modules/ext']);

  writeJson(path.join(root, 'app/package.json'), {
    name: 'app',
    dependencies: { shared: 'workspace:*', ext: '^1.0.0' },
    devDependencies: { lib: 'workspace:*' },
  });

  link(path.join(root, 'app/node_modules/lib'), path.join(root, 'lib'));

  link(path.join(root, 'app/node_modules/shared'), path.join(root, 'shared'));

  link(
    path.join(root, 'app/node_modules/ext'),
    path.join(root, 'node_modules/.pnpm/ext@1.0.0/node_modules/ext'),
  );

  writeJson(
    path.join(
      root,
      'node_modules/.pnpm/ext@1.0.0/node_modules/ext/package.json',
    ),
    { name: 'ext', exports: './dist/missing-but-not-ours.mjs' },
  );

  writeJson(path.join(root, 'lib/package.json'), {
    name: 'lib',
    exports: {
      '.': { types: './dist/types.d.mts', default: './dist/index.mjs' },
    },
    peerDependencies: { base: '^1.0.0' },
    devDependencies: { base: 'workspace:*', tooling: 'workspace:*' },
  });

  link(path.join(root, 'lib/node_modules/base'), path.join(root, 'base'));

  link(path.join(root, 'lib/node_modules/tooling'), path.join(root, 'tooling'));

  writeJson(path.join(root, 'base/package.json'), {
    name: 'base',
    exports: './dist/index.mjs',
  });

  writeJson(path.join(root, 'tooling/package.json'), {
    name: 'tooling',
    exports: './dist/index.mjs',
  });

  writeJson(path.join(root, 'shared/package.json'), {
    name: 'shared',
    exports: './src/index.mts',
  });

  touch(path.join(root, 'shared/src/index.mts'));

  return root;
};

describe(findLinkedPackages, () => {
  test('lists every sibling a package reaches, built or not, with who needs it', () => {
    const root = makeWorkspace();

    touch(path.join(root, 'base/dist/index.mjs'));

    assert.deepStrictEqual(findLinkedPackages(root, [path.join(root, 'app')]), [
      {
        packageDir: path.join(root, 'shared'),
        packageName: 'shared',
        neededBy: 'app',
      },
      {
        packageDir: path.join(root, 'lib'),
        packageName: 'lib',
        neededBy: 'app',
      },
      {
        packageDir: path.join(root, 'base'),
        packageName: 'base',
        neededBy: 'lib',
      },
    ]);
  });

  test('a package nothing links to is not listed', () => {
    const root = makeWorkspace();

    assert.deepStrictEqual(
      findLinkedPackages(root, [path.join(root, 'base')]),
      [],
    );
  });
});

describe(workspaceStartDirs, () => {
  test('is the root followed by each member the root `workspaces` names', () => {
    const root = makeWorkspace();

    writeJson(path.join(root, 'package.json'), {
      name: 'root',
      workspaces: ['app', 'lib', 'not-a-package'],
    });

    makeDirs(root, ['not-a-package']);

    assert.deepStrictEqual(workspaceStartDirs(root), [
      root,
      path.join(root, 'app'),
      path.join(root, 'lib'),
    ]);
  });
});

describe(findMissingBuilds, () => {
  test('reports a sibling whose build output is missing, and the sibling it reaches', () => {
    const root = makeWorkspace();

    assert.deepStrictEqual(findMissingBuilds(root, [path.join(root, 'app')]), [
      {
        packageDir: path.join(root, 'lib'),
        neededBy: 'app',
        missing: ['dist/types.d.mts', 'dist/index.mjs'],
      },
      {
        packageDir: path.join(root, 'base'),
        neededBy: 'lib',
        missing: ['dist/index.mjs'],
      },
    ]);
  });

  test('passes once the build output exists', () => {
    const root = makeWorkspace();

    touch(path.join(root, 'lib/dist/types.d.mts'));

    touch(path.join(root, 'lib/dist/index.mjs'));

    touch(path.join(root, 'base/dist/index.mjs'));

    assert.deepStrictEqual(
      findMissingBuilds(root, [path.join(root, 'app')]),
      [],
    );
  });

  test("follows a sibling's devDependencies only from the package it starts at", () => {
    const root = makeWorkspace();

    assert.deepStrictEqual(
      findMissingBuilds(root, [path.join(root, 'lib')]).map((m) =>
        path.basename(m.packageDir),
      ),
      ['base', 'tooling'],
    );
  });

  test('reports each package once across several starting points', () => {
    const root = makeWorkspace();

    assert.deepStrictEqual(
      findMissingBuilds(root, [
        path.join(root, 'app'),
        path.join(root, 'lib'),
      ]).map((m) => path.basename(m.packageDir)),
      ['lib', 'base', 'tooling'],
    );
  });

  test('a dependency pnpm has not linked is left to the install', () => {
    const root = makeWorkspace();

    fs.rmSync(path.join(root, 'app/node_modules/lib'));

    assert.deepStrictEqual(
      findMissingBuilds(root, [path.join(root, 'app')]),
      [],
    );
  });
});

describe(formatMissingBuilds, () => {
  test('names each package, what it lacks, who needs it, and what to run', () => {
    assert.strictEqual(
      formatMissingBuilds('/repo', [
        {
          packageDir: '/repo/libs/ts-data-forge',
          neededBy: 'ts-repo-utils',
          missing: ['dist/types.d.mts', 'dist/entry-point.mjs'],
        },
      ]),
      [
        'Build output is missing:',
        '  libs/ts-data-forge (needed by ts-repo-utils): dist/types.d.mts, dist/entry-point.mjs',
        'Run `pnpm run ws:build:deps` (or `ws:build`) first.',
      ].join('\n'),
    );
  });
});

describe('the script', () => {
  test('fails before anything else runs, saying what to build', async () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), 'assert-deps-built-cli-'),
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      path.join(root, 'package.json'),
      JSON.stringify({
        name: 'consumer',
        dependencies: { lib: 'workspace:*' },
      }),
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.join(root, 'node_modules'));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.join(root, 'packages/lib'), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      path.join(root, 'packages/lib/package.json'),
      JSON.stringify({ name: 'lib', exports: './dist/index.mjs' }),
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.symlinkSync(
      path.join(root, 'packages/lib'),
      path.join(root, 'node_modules/lib'),
      'dir',
    );

    const stderr = await execFileAsync(
      process.execPath,
      [scriptPath, '--root', root],
      { cwd: root },
    )
      .then(() => undefined)
      .catch((error: unknown) =>
        isRecord(error) && isString(error['stderr']) ? error['stderr'] : '',
      );

    // `undefined` means the script exited zero.
    assert.isTrue(isString(stderr));

    assert.include(stderr, 'packages/lib');

    assert.include(stderr, 'pnpm run ws:build:deps');
  });

  test('the script imports nothing outside node: builtins at runtime', () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const source = fs.readFileSync(scriptPath, 'utf8');

    // A top-level `import type` is erased by Node and so is allowed; an inline
    // `import { type X }` is not, because it keeps the module load.
    const specifiers = source
      .matchAll(/^import (?!type )[^;]* from '([^']+)';$/gmu)
      .map((m) => m[1])
      .toArray();

    assert.isNotEmpty(specifiers);

    assert.deepStrictEqual(
      specifiers.filter((s) => !(s?.startsWith('node:') ?? false)),
      [],
    );
  });
});
