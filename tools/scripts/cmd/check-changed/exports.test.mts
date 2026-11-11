import dedent from 'dedent';
import type { ReadonlyRecord } from 'ts-type-forge';
import { exportedNames, findPatchExportChanges } from './exports.mjs';

const reader =
  (files: ReadonlyRecord<string, string>) =>
  (file: string): Promise<string | undefined> =>
    Promise.resolve(files[file]);

describe(exportedNames, () => {
  test('reads declarations, named and namespace exports, through barrels', async () => {
    const names = await exportedNames(
      'libs/a/src/entry-point.mts',
      reader({
        'libs/a/src/entry-point.mts': dedent`
          export * from './array/index.mjs';
          export * as Num from './num.mjs';
          export { x as y } from './x.mjs';
          export * from 'other-package';
          export type Shape = { readonly a: number };
        `,
        'libs/a/src/array/index.mjs': 'not read: the .mts source is',
        'libs/a/src/array/index.mts': dedent`
          export * from './head.mjs';
          export const first = 1, { second, third: [fourth] } = obj;
        `,
        'libs/a/src/array/head.mts': dedent`
          export function head() {}
          export class Head {}
          export interface Item {}
          export enum Kind { A }
          const internal = 1;
        `,
      }),
    );

    assert.deepStrictEqual(
      Array.from(names).toSorted(),
      [
        "* from 'other-package'",
        'Head',
        'Item',
        'Kind',
        'Num',
        'Shape',
        'first',
        'fourth',
        'head',
        'second',
        'y',
      ].toSorted(),
    );
  });

  test('reads a barrel cycle once', async () => {
    const names = await exportedNames(
      'p/a.mts',
      reader({
        'p/a.mts': "export * from './b.mjs';\nexport const a = 1;",
        'p/b.mts': "export * from './a.mjs';\nexport const b = 1;",
      }),
    );

    assert.deepStrictEqual(Array.from(names).toSorted(), ['a', 'b']);
  });
});

describe(findPatchExportChanges, () => {
  const packages = [{ name: 'lib-a', dir: 'libs/lib-a' }] as const;

  const base = reader({
    'libs/lib-a/src/entry-point.mts': "export * from './core.mjs';",
    'libs/lib-a/src/core.mts': 'export const kept = 1;\nexport const gone = 1;',
  });

  const head = reader({
    'libs/lib-a/src/entry-point.mts': "export * from './core.mjs';",
    'libs/lib-a/src/core.mts':
      'export const kept = 1;\nexport const added = 1;',
  });

  const bump = (
    level: 'patch' | 'minor',
  ): Parameters<typeof findPatchExportChanges>[0]['bumps'] =>
    [{ file: '.changeset/x.md', name: 'lib-a', bump: level }] as const;

  test('names a new export, and a removed one, under a patch changeset', async () => {
    const warnings = await findPatchExportChanges({
      bumps: bump('patch'),
      packages,
      readAtBase: base,
      readAtHead: head,
    });

    expect(warnings).toHaveLength(2);

    expect(warnings[0]).toContain('gains `added`');

    expect(warnings[0]).toContain('`minor`');

    expect(warnings[1]).toContain('no longer exports `gone`');
  });

  test('says nothing under a minor changeset', async () => {
    assert.deepStrictEqual(
      await findPatchExportChanges({
        bumps: bump('minor'),
        packages,
        readAtBase: base,
        readAtHead: head,
      }),
      [],
    );
  });

  test('says nothing of a package no changeset names, or one new at the head', async () => {
    assert.deepStrictEqual(
      await findPatchExportChanges({
        bumps: [],
        packages,
        readAtBase: base,
        readAtHead: head,
      }),
      [],
    );

    assert.deepStrictEqual(
      await findPatchExportChanges({
        bumps: bump('patch'),
        packages,
        readAtBase: reader({}),
        readAtHead: head,
      }),
      [],
    );
  });

  test('says nothing when the exported names stay', async () => {
    assert.deepStrictEqual(
      await findPatchExportChanges({
        bumps: bump('patch'),
        packages,
        readAtBase: base,
        readAtHead: base,
      }),
      [],
    );
  });
});
