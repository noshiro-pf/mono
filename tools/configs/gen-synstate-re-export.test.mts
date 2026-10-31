import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  synstateReExportSource,
  typeOnlyExportsOf,
} from './gen-synstate-re-export.mjs';

describe('typeOnlyExportsOf', () => {
  test("follows `export *`, as synstate's entry declarations are written", async () => {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'gen-synstate-re-export-'),
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.join(dir, 'core.d.mts'),
      'export type Observable = 1;\nexport declare const map: number;\n',
    );

    const declarationFile = path.join(dir, 'index.d.mts');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(declarationFile, "export * from './core.mjs';\n");

    try {
      assert.deepStrictEqual(typeOnlyExportsOf(declarationFile), [
        'Observable',
      ]);
    } finally {
      await fs.rm(dir, { recursive: true });
    }
  });

  test('lists the exports that have no value, sorted', async () => {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'gen-synstate-re-export-'),
    );

    const declarationFile = path.join(dir, 'index.d.mts');

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      declarationFile,
      [
        'export type Zeta = 1;',
        'export interface Alpha {}',
        'export declare const value: number;',
        'export declare class Both {}',
        'export declare function fn(): void;',
        'type Renamed = 2;',
        'export type { Renamed as Beta };',
        'declare const aliased: number;',
        'export { aliased };',
      ].join('\n'),
    );

    try {
      assert.deepStrictEqual(typeOnlyExportsOf(declarationFile), [
        'Alpha',
        'Beta',
        'Zeta',
      ]);
    } finally {
      await fs.rm(dir, { recursive: true });
    }
  });
});

describe('synstateReExportSource', () => {
  test('throws on an exclude synstate does not export', () => {
    assert.throws(
      () =>
        synstateReExportSource({
          valueExports: ['createState'],
          excludes: ['createState', 'createReducer'],
          typeExports: [],
        }),
      /createReducer/u,
    );
  });

  test('re-exports the values but the excluded ones, and every type', () => {
    assert.strictEqual(
      synstateReExportSource({
        valueExports: ['combine', 'createState', 'map'],
        excludes: ['createState'],
        typeExports: ['Observable', 'Subscription'],
      }),
      [
        "export { combine, map } from 'synstate';",
        '',
        "export type { Observable, Subscription } from 'synstate';",
        '',
      ].join('\n'),
    );
  });
});
