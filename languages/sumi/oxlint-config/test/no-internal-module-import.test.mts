import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runOxlint } from '../src/index.mjs';

/**
 * The package half of the rule needs packages to resolve, which the corpus
 * (a fixture tree with no node_modules) cannot hold: a temporary project
 * with two packages, one with an `exports` map and one without.
 */

const CODE = 'sumi(no-internal-module-import)';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sumi-internal-module-'));

const write = (name: string, code: string): string => {
  const file = path.join(dir, name);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(file, code);

  return file;
};

write(
  'tsconfig.json',
  JSON.stringify({
    compilerOptions: {
      strict: true,
      module: 'nodenext',
      moduleResolution: 'nodenext',
      target: 'esnext',
      noEmit: true,
      types: [],
      lib: ['esnext'],
    },
    include: ['*.mts'],
  }),
);

write(
  'node_modules/with-exports/package.json',
  JSON.stringify({
    name: 'with-exports',
    exports: { '.': './a.mjs', './sub': './sub.mjs' },
  }),
);

write('node_modules/with-exports/a.d.mts', 'export const a: number;\n');

write('node_modules/with-exports/sub.d.mts', 'export const sub: number;\n');

write(
  'node_modules/@scope/legacy/package.json',
  JSON.stringify({
    name: '@scope/legacy',
    main: './index.js',
    types: './index.d.ts',
  }),
);

write(
  'node_modules/@scope/legacy/index.d.ts',
  'export const legacy: number;\n',
);

write(
  'node_modules/@scope/legacy/lib/deep.d.ts',
  'export const deep: number;\n',
);

write('a/b.mts', 'export const b = 1;\n');

write('a/index.mts', 'export const indexed = 1;\n');

const files = {
  exposedSubpath: write(
    'exposed-subpath.mts',
    "import { sub } from 'with-exports/sub';\nexport const x = sub;\n",
  ),
  legacyName: write(
    'legacy-name.mts',
    "import { legacy } from '@scope/legacy';\nexport const x = legacy;\n",
  ),
  legacyDeep: write(
    'legacy-deep.mts',
    "import { deep } from '@scope/legacy/lib/deep.js';\nexport const x = deep;\n",
  ),
  unknownPackage: write(
    'unknown-package.mts',
    "import { y } from 'not-installed/sub';\nexport const x = y;\n",
  ),
  builtin: write(
    'builtin.mts',
    "import * as fsp from 'node:fs/promises';\nexport const x = fsp.readFile;\n",
  ),
  directoryIndex: write(
    'directory-index.mts',
    "import { indexed } from './a/index.mjs';\nexport const x = indexed;\n",
  ),
  reach: write(
    'reach.mts',
    "import { b } from './a/b.mjs';\nexport const x = b;\n",
  ),
  dynamicReach: write(
    'dynamic-reach.mts',
    "export const load = async (): Promise<number> => (await import('./a/b.mjs')).b;\n",
  ),
} as const;

const run = runOxlint(Object.values(files));

const codesOf = (file: string): readonly string[] =>
  run.diagnostics
    .filter((d) => d.filename === file && d.code === CODE)
    .map((d) => d.code);

describe('sumi/no-internal-module-import', () => {
  test('a subpath the package exports is allowed', () => {
    assert.deepStrictEqual(codesOf(files.exposedSubpath), []);
  });

  test('a package without exports is imported by name', () => {
    assert.deepStrictEqual(codesOf(files.legacyName), []);
  });

  test('a subpath of a package without exports is internal', () => {
    assert.deepStrictEqual(codesOf(files.legacyDeep), [CODE]);
  });

  test('a package that cannot be found is left to the type check', () => {
    assert.deepStrictEqual(codesOf(files.unknownPackage), []);
  });

  test('node: builtins are not packages', () => {
    assert.deepStrictEqual(codesOf(files.builtin), []);
  });

  test('a directory index is allowed', () => {
    assert.deepStrictEqual(codesOf(files.directoryIndex), []);
  });

  test('reaching into a directory is reported, statically and dynamically', () => {
    assert.deepStrictEqual(codesOf(files.reach), [CODE]);

    assert.deepStrictEqual(codesOf(files.dynamicReach), [CODE]);
  });
});
