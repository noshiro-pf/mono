import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findUndeclaredTypeReferences,
  promisedTypePackages,
} from './check-dist-type-references.mjs';

describe(promisedTypePackages, () => {
  test('takes the dependencies and the peers not marked optional', () => {
    assert.deepStrictEqual(
      Array.from(
        promisedTypePackages({
          dependencies: { '@types/node': '^24.0.0', a: '^1.0.0' },
          peerDependencies: { b: '^2.0.0', c: '^3.0.0' },
          peerDependenciesMeta: { c: { optional: true } },
          devDependencies: { d: '^4.0.0' },
          optionalDependencies: { e: '^5.0.0' },
        }),
      ).toSorted(),
      ['@types/node', 'a', 'b'],
    );
  });

  test('takes nothing from a manifest that declares none', () => {
    assert.deepStrictEqual(Array.from(promisedTypePackages({})), []);
  });
});

describe(findUndeclaredTypeReferences, () => {
  test('reports a reference in a file an entry point reaches, by any import form', async () => {
    const found = await findIn({
      files: {
        'dist/index.d.mts': [
          "import type { A } from './a.mjs';",
          "export * from './b.mjs';",
          "export declare const c: import('./c.mjs').C;",
        ].join('\n'),
        'dist/a.d.mts': '/// <reference types="node" />\nexport type A = 1;',
        'dist/b.d.mts': '/// <reference types="jest" />\nexport type B = 1;',
        'dist/c.d.mts':
          '/// <reference types="@scope/env" />\nexport type C = 1;',
      },
    });

    assert.deepStrictEqual(found, [
      { file: 'dist/a.d.mts', reference: 'node' },
      { file: 'dist/b.d.mts', reference: 'jest' },
      { file: 'dist/c.d.mts', reference: '@scope/env' },
    ]);
  });

  test('reports one in a file a `reference path` reaches', async () => {
    const found = await findIn({
      files: {
        'dist/index.d.mts':
          '/// <reference path="./globals.d.ts" />\nexport {};',
        'dist/globals.d.ts': '/// <reference types="node" />',
      },
    });

    assert.deepStrictEqual(found, [
      { file: 'dist/globals.d.ts', reference: 'node' },
    ]);
  });

  test('passes a reference to a package promised, itself or through its @types package', async () => {
    const found = await findIn({
      promised: ['@types/node', 'bun-types', '@types/scope__env'],
      files: {
        'dist/index.d.mts': [
          '/// <reference types="node" />',
          '/// <reference types="bun-types" />',
          '/// <reference types="@scope/env" />',
          'export {};',
        ].join('\n'),
      },
    });

    assert.deepStrictEqual(found, []);
  });

  test('leaves alone a file no entry point reaches, such as a command', async () => {
    const found = await findIn({
      files: {
        'dist/index.d.mts': 'export type A = 1;',
        'dist/cmd/main.d.mts': '/// <reference types="node" />\nexport {};',
      },
    });

    assert.deepStrictEqual(found, []);
  });

  test('reads a file reached twice, or in a cycle, once', async () => {
    const found = await findIn({
      files: {
        'dist/index.d.mts':
          "export * from './a.mjs';\nexport * from './b.mjs';",
        'dist/a.d.mts':
          '/// <reference types="node" />\nexport * from \'./b.mjs\';',
        'dist/b.d.mts': "export * from './a.mjs';\nexport type B = 1;",
      },
    });

    assert.deepStrictEqual(found, [
      { file: 'dist/a.d.mts', reference: 'node' },
    ]);
  });

  test("does not read another package's declarations", async () => {
    const found = await findIn({
      files: {
        'dist/index.d.mts': "export type { X } from 'other';",
        'node_modules/other/package.json': JSON.stringify({
          name: 'other',
          types: './index.d.mts',
        }),
        'node_modules/other/index.d.mts':
          '/// <reference types="node" />\nexport type X = 1;',
      },
    });

    assert.deepStrictEqual(found, []);
  });
});

/**
 * What {@link findUndeclaredTypeReferences} reports of a package written to a
 * temporary directory as `files`, whose one entry point is `dist/index.d.mts`
 * and which promises `promised`, its file paths relative to the package.
 */
const findIn = async ({
  files,
  promised = [],
}: Readonly<{
  files: ReadonlyRecord<string, string>;
  promised?: readonly string[];
}>): Promise<readonly Readonly<{ file: string; reference: string }>[]> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dist-type-refs-'));

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under a fresh temporary directory
    await fs.writeFile(
      path.join(dir, 'package.json'),
      JSON.stringify({ name: 'pkg', type: 'module' }),
    );

    for (const [file, text] of Object.entries(files)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under a fresh temporary directory
      await fs.mkdir(path.dirname(path.join(dir, file)), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under a fresh temporary directory
      await fs.writeFile(path.join(dir, file), text);
    }

    const found = await findUndeclaredTypeReferences(
      [path.join(dir, 'dist/index.d.mts')],
      dir,
      new Set(promised),
    );

    return found.map(({ file, reference }) => ({
      file: path.relative(dir, file).split(path.sep).join('/'),
      reference,
    }));
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};
