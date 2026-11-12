import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord, StrictPick } from 'ts-type-forge';
import {
  findForgottenExports,
  packagesRead,
  selectPackages,
  type Finding,
} from './check-forgotten-exports.mjs';

describe(selectPackages, () => {
  const enrolled = [
    { name: 'a', path: '/r/libs/a' },
    { name: 'b', path: '/r/libs/b' },
  ] as const;

  test('every package when no directory is given', () => {
    assert.deepStrictEqual(
      selectPackages(enrolled, [], '/r'),
      Result.ok(enrolled),
    );
  });

  test('the packages in the directories given, a trailing slash or not', () => {
    assert.deepStrictEqual(
      selectPackages(enrolled, ['libs/b/'], '/r'),
      Result.ok([{ name: 'b', path: '/r/libs/b' }]),
    );
  });

  test('names each directory that holds no package read', () => {
    const selected = selectPackages(
      enrolled,
      ['libs/a', 'apps/app', 'libs/private'],
      '/r',
    );

    assert.isTrue(Result.isErr(selected));

    assert.include(selected.value, 'apps/app, libs/private: not a package');
  });
});

describe(packagesRead, () => {
  const privateRead = new Set<string>(['private-read', 'made-public']);

  const withTypes = {
    exports: { '.': { types: './dist/index.d.mts' } },
  } as const;

  test('reads a published package under libs/ and a private one listed, each with a types file', () => {
    const { enrolled, stale } = packagesRead(
      [
        {
          name: 'published',
          path: '/r/libs/published',
          packageJson: withTypes,
        },
        {
          name: 'private-read',
          path: '/r/libs/private-read',
          packageJson: { ...withTypes, private: true },
        },
        {
          name: 'private-other',
          path: '/r/libs/private-other',
          packageJson: { ...withTypes, private: true },
        },
        { name: 'app', path: '/r/apps/app', packageJson: withTypes },
        {
          name: 'made-public',
          path: '/r/libs/made-public',
          packageJson: withTypes,
        },
      ],
      '/r',
      privateRead,
    );

    assert.deepStrictEqual(
      enrolled.map(({ name }) => name),
      ['published', 'private-read', 'made-public'],
    );

    // Listed as private, but published now.
    assert.deepStrictEqual(stale, ['made-public']);
  });

  test('reads no package without a types file, and reports a name of the private list that is no private package read', () => {
    const { enrolled, stale } = packagesRead(
      [
        { name: 'published', path: '/r/libs/published', packageJson: {} },
        {
          name: 'private-read',
          path: '/r/libs/private-read',
          packageJson: { private: true },
        },
      ],
      '/r',
      privateRead,
    );

    assert.deepStrictEqual(enrolled, []);

    assert.deepStrictEqual(stale, ['private-read', 'made-public']);
  });
});

describe(findForgottenExports, () => {
  const mut_dirs: string[] = [];

  /**
   * A package directory holding `files`, and its `dist/index.d.mts`. A
   * declaration file without `export {}` exports every top-level declaration,
   * so a fixture that keeps one to itself ends with it, as `tsc` emits.
   */
  const makePackage = async (
    files: ReadonlyRecord<string, string>,
  ): Promise<Readonly<{ dir: string; entry: string }>> => {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'check-forgotten-exports-test-'),
    );

    mut_dirs.push(dir);

    await Promise.all(
      Object.entries(files).map(async ([file, content]) => {
        const target = path.join(dir, file);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(path.dirname(target), { recursive: true });

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(target, content);
      }),
    );

    return { dir, entry: path.join(dir, 'dist/index.d.mts') };
  };

  const findingsIn = async (
    files: ReadonlyRecord<string, string>,
  ): Promise<readonly StrictPick<Finding, 'declaration' | 'type'>[]> => {
    const { dir, entry } = await makePackage(files);

    return findForgottenExports([entry], dir).map(({ declaration, type }) => ({
      declaration,
      type,
    }));
  };

  afterAll(async () => {
    await Promise.all(
      mut_dirs.map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  test('reports a parameter type the entry point does not export', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          export { pipe } from './pipe.mjs';
        `,
        'dist/pipe.d.mts': dedent`
          export type Operator<A, B> = (a: A) => B;
          export declare const pipe: <A, B>(op: Operator<A, B>) => B;
        `,
      }),
      [{ declaration: 'pipe', type: 'Operator' }],
    );
  });

  test('accepts a type exported under another name, or as a type only', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          export { pipe, type Operator as Op } from './pipe.mjs';
          export { type Node } from './node.mjs';
        `,
        'dist/pipe.d.mts': dedent`
          import type { Node } from './node.mjs';
          export type Operator<A, B> = (a: A) => B;
          export declare const pipe: <A, B>(op: Operator<A, B>, n: Node) => B;
        `,
        'dist/node.d.mts': dedent`
          export declare class Node {
            private constructor();
          }
        `,
      }),
      [],
    );
  });

  test('reports a base class, a member and an import type', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          export { Owner } from './owner.mjs';
        `,
        'dist/owner.d.mts': dedent`
          declare class Base {}
          type Node = Readonly<{ id: number }>;
          export declare class Owner extends Base {
            adopt(node: Node): void;
            other(): import('./other.mjs').Other;
          }
        `,
        'dist/other.d.mts': dedent`
          export type Other = string;
        `,
      }),
      [
        { declaration: 'Owner', type: 'Base' },
        { declaration: 'Owner', type: 'Node' },
        { declaration: 'Owner', type: 'Other' },
      ],
    );
  });

  test('accepts a name exported both as a type and as a namespace', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          export { Box } from './box.mjs';
        `,
        'dist/box.d.mts': dedent`
          import type { Inner } from './inner.mjs';
          export type Box<A> = Readonly<{ value: A; inner: Inner }>;
          export * as Box from './impl.mjs';
        `,
        'dist/impl.d.mts': dedent`
          import type { Box } from './box.mjs';
          export declare const of: <A>(value: A) => Box<A>;
        `,
        'dist/inner.d.mts': dedent`
          export type Inner = number;
        `,
      }),
      [{ declaration: 'Box', type: 'Inner' }],
    );
  });

  test('reads the members of an exported namespace as exported', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          export declare namespace Arr {
            type Item = number;
            const first: (xs: readonly Item[]) => Item;
          }
        `,
      }),
      [],
    );
  });

  test('reads a namespace through its exported members alone', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          type Secret = number;
          export declare function f(x: number): number;
          export declare namespace f {
            const y: (x: Secret) => number;
          }
          export declare namespace NS {
            type Hidden = Readonly<{ s: Secret }>;
            export const first: (x: Secret) => number;
            export {};
          }
          export {};
        `,
      }),
      [
        { declaration: 'f.y', type: 'Secret' },
        { declaration: 'NS.first', type: 'Secret' },
      ],
    );
  });

  test('reads a base that is a value, as tsc writes for a mixin, through its type', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          type Secret = number;
          declare const C_base: new () => Readonly<{ a: Secret }>;
          export declare class C extends C_base {}
          declare const D_base: new () => Readonly<{ b: number }>;
          export declare class D extends D_base {}
          declare const E_base: typeof import('./base.mjs').Base;
          export declare class E extends E_base {}
          export {};
        `,
        'dist/base.d.mts': dedent`
          export declare class Base {}
        `,
      }),
      [{ declaration: 'C', type: 'Secret' }],
    );
  });

  test('names a type imported under another name by its own name', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          import type { Secret as S } from './secret.mjs';
          import type Hidden from './hidden.mjs';
          export declare const x: (s: S, h: Hidden) => void;
          export {};
        `,
        'dist/secret.d.mts': dedent`
          export type Secret = number;
        `,
        'dist/hidden.d.mts': dedent`
          export default interface Hidden {
            readonly h: number;
          }
        `,
      }),
      [
        { declaration: 'x', type: 'Secret' },
        { declaration: 'x', type: 'Hidden' },
      ],
    );
  });

  test('reports two types of one name apart, each with its file', async () => {
    const { dir, entry } = await makePackage({
      'dist/index.d.mts': dedent`
        import type { Opts as A } from './a.mjs';
        import type { Opts as B } from './b.mjs';
        export declare const x: (a: A, b: B) => void;
        export {};
      `,
      'dist/a.d.mts': dedent`
        export type Opts = Readonly<{ a: number }>;
      `,
      'dist/b.d.mts': dedent`
        export type Opts = Readonly<{ b: number }>;
      `,
    });

    assert.deepStrictEqual(
      findForgottenExports([entry], dir).map(({ type, typeFile }) => ({
        type,
        typeFile: path.relative(dir, typeFile),
      })),
      [
        { type: 'Opts', typeFile: 'dist/a.d.mts' },
        { type: 'Opts', typeFile: 'dist/b.d.mts' },
      ],
    );
  });

  test('passes over a type a consumer reaches elsewhere: a global, or one of a module outside the package', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          /// <reference path="./globals.d.ts" />
          declare namespace Rule {
            type Entry = 'off';
          }
          type Top = 'on';
          declare global {
            interface InGlobal {
              readonly g: number;
            }
          }
          declare module 'outside-lib' {
            interface Augmented {
              readonly o: number;
            }
          }
          declare module './other.mjs' {
            interface OwnAugmented {
              readonly o: number;
            }
          }
          export type Rules = Readonly<{
            a: Rule.Entry;
            b: Top;
            c: InGlobal;
            d: import('outside-lib').Augmented;
            e: import('./other.mjs').OwnAugmented;
            f: InScript;
          }>;
          export {};
        `,
        'dist/globals.d.ts': dedent`
          interface InScript {
            readonly s: number;
          }
        `,
        'dist/other.d.mts': dedent`
          export interface Base {
            readonly b: number;
          }
        `,
        'node_modules/outside-lib/package.json': JSON.stringify({
          name: 'outside-lib',
          types: './index.d.ts',
        }),
        'node_modules/outside-lib/index.d.ts': dedent`
          export interface Base {
            readonly b: number;
          }
        `,
      }),
      [
        { declaration: 'Rules', type: 'Entry' },
        { declaration: 'Rules', type: 'Top' },
        { declaration: 'Rules', type: 'OwnAugmented' },
      ],
    );
  });

  test('reports a declaration exported both directly and through a namespace once, by its direct name', async () => {
    for (const index of [
      dedent`
        export * as Arr from './a.mjs';
        export { first } from './a.mjs';
      `,
      dedent`
        export { first } from './a.mjs';
        export * as Arr from './a.mjs';
      `,
    ]) {
      const findings = await findingsIn({
        'dist/index.d.mts': index,
        'dist/a.d.mts': dedent`
          type Secret = number;
          export declare const first: () => Secret;
          export {};
        `,
      });

      assert.deepStrictEqual(findings, [
        { declaration: 'first', type: 'Secret' },
      ]);
    }
  });

  test("reads an augmentation of another package by its own members, under the module name or the entry point's", async () => {
    const outsideLib = {
      'node_modules/outside-lib/package.json': JSON.stringify({
        name: 'outside-lib',
        types: './index.d.ts',
      }),
      'node_modules/outside-lib/index.d.ts': dedent`
        export interface Base {
          readonly b: number;
        }
      `,
    } as const;

    assert.deepStrictEqual(
      await findingsIn({
        ...outsideLib,
        'dist/index.d.mts': dedent`
          type Secret = number;
          type Local = number;
          declare module 'outside-lib' {
            interface Shown {
              l: Local;
            }
            function make(): Secret;
          }
          export {};
        `,
      }),
      [
        { declaration: '"outside-lib".make', type: 'Secret' },
        { declaration: '"outside-lib".Shown', type: 'Local' },
      ],
    );

    assert.deepStrictEqual(
      await findingsIn({
        ...outsideLib,
        'dist/index.d.mts': dedent`
          export * as Aug from './aug.mjs';
        `,
        'dist/aug.d.mts': dedent`
          type Secret = number;
          declare module 'outside-lib' {
            interface Augmented {
              s: Secret;
            }
          }
          export type { Augmented } from 'outside-lib';
        `,
      }),
      [{ declaration: 'Aug.Augmented', type: 'Secret' }],
    );
  });

  test('reads what `export =` exports, in a UMD global and in a module a file that is not a module declares', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          /// <reference path="./umd.d.ts" />
          /// <reference path="./ambient.d.ts" />
          export {};
        `,
        'dist/umd.d.ts': dedent`
          interface Private {
            readonly p: number;
          }
          declare class Lib {
            m(p: Private): void;
          }
          export = Lib;
          export as namespace Lib;
        `,
        'dist/ambient.d.ts': dedent`
          declare module 'ambient-lib' {
            interface Hidden {
              readonly h: number;
            }
            function make(h: Hidden): void;
            export = make;
          }
        `,
      }),
      [
        { declaration: 'Lib', type: 'Private' },
        { declaration: '"ambient-lib"', type: 'Hidden' },
      ],
    );
  });

  test('reads what `export =` exports from an entry point, once for a class with statics, named as `export = A`', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          interface Private {
            readonly p: number;
          }
          declare class Lib {
            static s: Private;
            m(p: Private): void;
          }
          export = Lib;
        `,
      }),
      [{ declaration: 'export = Lib', type: 'Private' }],
    );
  });

  test("names the members of what an entry point's `export =` stands for as a consumer imports them, and a class merged with a namespace once", async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          interface Private {
            readonly p: number;
          }
          declare class Lib {
            static s: Private;
          }
          declare namespace Lib {
            const v: Private;
          }
          export = Lib;
        `,
      }),
      [
        { declaration: 'export = Lib', type: 'Private' },
        { declaration: 'v', type: 'Private' },
      ],
    );

    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          interface P {
            readonly p: number;
          }
          declare namespace NS {
            const f: (p: P) => void;
          }
          export = NS;
        `,
      }),
      [{ declaration: 'f', type: 'P' }],
    );

    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          interface P {
            readonly p: number;
          }
          declare const _default: { f: (p: P) => void };
          export = _default;
        `,
      }),
      [{ declaration: 'export = _default', type: 'P' }],
    );

    // An enum is exported by `export =` too, so its members may name it.
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          declare enum Color {
            Red = 0,
          }
          declare namespace Color {
            function parse(s: string): Color;
          }
          export = Color;
        `,
      }),
      [],
    );

    // `import … = require` is CommonJS, so this entry point is a .d.cts.
    const { dir } = await makePackage({
      'dist/index.d.cts': dedent`
        import impl = require('./impl.cjs');
        export = impl;
      `,
      'dist/impl.d.cts': dedent`
        interface P {
          readonly p: number;
        }
        export declare const f: (p: P) => void;
        export {};
      `,
    });

    assert.deepStrictEqual(
      findForgottenExports([path.join(dir, 'dist/index.d.cts')], dir).map(
        ({ declaration, type }) => ({ declaration, type }),
      ),
      [{ declaration: 'f', type: 'P' }],
    );
  });

  test("reports what two entry points' `export =` stand for apart, though declared in one file", async () => {
    const { dir } = await makePackage({
      'dist/a.d.mts': dedent`
        import { A } from './shared.mjs';
        export = A;
      `,
      'dist/b.d.mts': dedent`
        import { B } from './shared.mjs';
        export = B;
      `,
      'dist/shared.d.mts': dedent`
        interface P {
          readonly p: number;
        }
        export declare class A {
          m(p: P): void;
        }
        export declare class B {
          m(p: P): void;
        }
        export {};
      `,
    });

    assert.deepStrictEqual(
      findForgottenExports(
        [path.join(dir, 'dist/a.d.mts'), path.join(dir, 'dist/b.d.mts')],
        dir,
      ).map(({ declaration, type }) => ({ declaration, type })),
      [
        { declaration: 'export = A', type: 'P' },
        { declaration: 'export = B', type: 'P' },
      ],
    );
  });

  test('reports two declarations of one name, each an entry point exports, apart', async () => {
    const { dir } = await makePackage({
      'dist/a.d.mts': dedent`
        import { N1 } from './shared.mjs';
        export = N1.C;
      `,
      'dist/b.d.mts': dedent`
        import { N2 } from './shared.mjs';
        export = N2.C;
      `,
      'dist/c.d.mts': dedent`
        export { A as X } from './shared.mjs';
      `,
      'dist/d.d.mts': dedent`
        export { B as X } from './shared.mjs';
      `,
      'dist/shared.d.mts': dedent`
        interface P {
          readonly p: number;
        }
        export declare namespace N1 {
          class C {
            m(p: P): void;
          }
        }
        export declare namespace N2 {
          class C {
            m(p: P): void;
          }
        }
        export declare class A {
          m(p: P): void;
        }
        export declare class B {
          m(p: P): void;
        }
        export {};
      `,
    });

    assert.deepStrictEqual(
      findForgottenExports(
        ['a', 'b', 'c', 'd'].map((name) =>
          path.join(dir, `dist/${name}.d.mts`),
        ),
        dir,
      ).map(({ declaration, type }) => ({ declaration, type })),
      [
        { declaration: 'export = N1.C', type: 'P' },
        { declaration: 'export = N2.C', type: 'P' },
        { declaration: 'X', type: 'P' },
        { declaration: 'X', type: 'P' },
      ],
    );
  });

  test('names what `export =` stands for as the entry point writes it: an imported alias, a qualified name', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          import { A as Foo } from './shared.mjs';
          export = Foo;
        `,
        'dist/shared.d.mts': dedent`
          interface P {
            readonly p: number;
          }
          export declare class A {
            m(p: P): void;
          }
          export {};
        `,
      }),
      [{ declaration: 'export = Foo', type: 'P' }],
    );

    // A qualified name by its identifiers, whatever lies between them.
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          import { NS } from './shared.mjs';
          export = NS /* the class */
            .Inner.C;
        `,
        'dist/shared.d.mts': dedent`
          interface P {
            readonly p: number;
          }
          export declare namespace NS {
            namespace Inner {
              class C {
                m(p: P): void;
              }
            }
          }
          export {};
        `,
      }),
      [{ declaration: 'export = NS.Inner.C', type: 'P' }],
    );
  });

  test('names an augmentation of a module with `export =` under the module, and reads a declared class with statics once', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          /// <reference path="./ambient.d.ts" />
          type Hidden = number;
          declare module 'foreign' {
            interface Added {
              h: Hidden;
            }
          }
          export {};
        `,
        'dist/ambient.d.ts': dedent`
          declare module 'ambient-class' {
            interface Secret {
              readonly s: number;
            }
            class C {
              static s: Secret;
              m(s: Secret): void;
            }
            export = C;
          }
        `,
        'node_modules/foreign/package.json': JSON.stringify({
          name: 'foreign',
          types: './index.d.ts',
        }),
        'node_modules/foreign/index.d.ts': dedent`
          declare function f(): void;
          declare namespace f {
            interface Base {
              readonly b: number;
            }
          }
          export = f;
        `,
      }),
      [
        { declaration: '"ambient-class"', type: 'Secret' },
        { declaration: '"foreign".Added', type: 'Hidden' },
      ],
    );
  });

  test('reads a global block inside an augmentation, a module declared in a file that is not a module, and a UMD global', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          /// <reference path="./globals.d.ts" />
          /// <reference path="./umd.d.mts" />
          type Secret = number;
          declare module 'outside-lib' {
            global {
              interface InnerGlobal {
                s: Secret;
              }
            }
          }
          export {};
        `,
        'dist/globals.d.ts': dedent`
          declare module 'ambient-lib' {
            interface FromScript {
              h: import('./hidden.mjs').Hidden;
            }
          }
        `,
        'dist/hidden.d.mts': dedent`
          export type Hidden = number;
        `,
        'dist/umd.d.mts': dedent`
          type Private = number;
          export as namespace Lib;
          export interface Opts {
            p: Private;
          }
          export {};
        `,
        'node_modules/outside-lib/package.json': JSON.stringify({
          name: 'outside-lib',
          types: './index.d.ts',
        }),
        'node_modules/outside-lib/index.d.ts': dedent`
          export interface Base {
            readonly b: number;
          }
        `,
      }),
      [
        { declaration: '"ambient-lib".FromScript', type: 'Hidden' },
        { declaration: 'InnerGlobal', type: 'Secret' },
        { declaration: 'Lib.Opts', type: 'Private' },
      ],
    );
  });

  test('reads a global of a declaration file that is not a module as exported', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          /// <reference path="./globals.d.ts" />
          export declare const g: InScript;
        `,
        'dist/globals.d.ts': dedent`
          interface InScript {
            readonly s: import('./hidden.mjs').Secret;
          }
        `,
        'dist/hidden.d.mts': dedent`
          export type Secret = number;
        `,
      }),
      [{ declaration: 'InScript', type: 'Secret' }],
    );
  });

  test('reports a declaration a namespace re-exports by name, or exported under two names, once, by its first direct name', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          export * as Arr from './a.mjs';
          export * as Again from './a.mjs';
          export { first, first as head } from './b.mjs';
        `,
        'dist/a.d.mts': dedent`
          export { first } from './b.mjs';
        `,
        'dist/b.d.mts': dedent`
          type Secret = number;
          export declare const first: () => Secret;
          export {};
        `,
      }),
      [{ declaration: 'first', type: 'Secret' }],
    );
  });

  test('reads a global or an augmentation of another package as exported, once however often named', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          type Secret = number;
          type Augmenting = number;
          declare global {
            class GBase {
              s: Secret;
            }
            interface GInterface {
              s: Secret;
            }
          }
          declare module 'outside-lib' {
            interface Augmented {
              readonly a: Augmenting;
            }
          }
          export declare class X extends GBase {}
          export declare class Y extends GBase {}
          export interface Z extends GInterface {}
          export declare const z: GInterface;
          export {};
        `,
        'node_modules/outside-lib/package.json': JSON.stringify({
          name: 'outside-lib',
          types: './index.d.ts',
        }),
        'node_modules/outside-lib/index.d.ts': dedent`
          export interface Base {
            readonly b: number;
          }
        `,
      }),
      [
        { declaration: 'GBase', type: 'Secret' },
        { declaration: 'GInterface', type: 'Secret' },
        { declaration: '"outside-lib".Augmented', type: 'Augmenting' },
      ],
    );
  });

  test('reads an @internal reason on the declaration a reference names, not on a namespace merged with it', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          interface Options {
            readonly a: number;
          }
          /** @internal Its helpers are reached through f alone. */
          declare namespace Options {
            type Helper = number;
          }
          export declare const f: (options: Options) => void;
          export {};
        `,
      }),
      [{ declaration: 'f', type: 'Options' }],
    );
  });

  test('names the enum of a member', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          declare enum E { A = 0 }
          export declare const x: E.A;
          export {};
        `,
      }),
      [{ declaration: 'x', type: 'E' }],
    );
  });

  test('passes a type tagged @internal with a reason, itself or by a namespace holding it', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          /**
           * A step of Pair.
           *
           * @internal Spelled through Pair alone.
           */
          type Step<A> = readonly [A, A];
          /** @internal One namespace per rule, reached by indexing Rules. */
          declare namespace NoConsole {
            type Options = Readonly<{ allow: readonly string[] }>;
          }
          export type Pair<A> = Step<A>;
          export type Rules = Readonly<{ 'no-console': NoConsole.Options }>;
          export {};
        `,
      }),
      [],
    );
  });

  test('passes a type whose @internal reason is on any of its declarations', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          interface Merged {
            readonly a: number;
          }
          /** @internal Spelled through Box alone. */
          interface Merged {
            readonly b: number;
          }
          export type Box = Readonly<{ m: Merged }>;
          export {};
        `,
      }),
      [],
    );
  });

  test('does not read into a base class tagged @internal with a reason', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          type Hidden = number;
          /** @internal Reached through X alone. */
          declare class Base {
            m(): Hidden;
          }
          export declare class X extends Base {}
          export {};
        `,
      }),
      [],
    );
  });

  test('reports a type whose @internal tag gives no reason', async () => {
    const { dir, entry } = await makePackage({
      'dist/index.d.mts': dedent`
        /** @internal */
        type Step<A> = readonly [A, A];
        type Plain = Readonly<{ a: number }>;
        export declare const f: (step: Step<number>, plain: Plain) => void;
        export {};
      `,
    });

    assert.deepStrictEqual(
      findForgottenExports([entry], dir).map(({ type, bareInternalTag }) => ({
        type,
        bareInternalTag,
      })),
      [
        { type: 'Step', bareInternalTag: true },
        { type: 'Plain', bareInternalTag: false },
      ],
    );
  });

  test('fails on an entry point that cannot be read', async () => {
    const { dir } = await makePackage({ 'dist/index.d.mts': '' });

    assert.throws(() =>
      findForgottenExports([path.join(dir, 'dist/missing.d.mts')], dir),
    );
  });

  test('passes over what only computes a type', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          declare const names: readonly ['a', 'b'];
          type Key = 'a';
          type Keep<K> = K extends Key ? K : never;
          export type Name = (typeof names)[number];
          export type Picked<T> = { [K in keyof T as Keep<K>]: T[K] };
          export type IsKey<T> = T extends Key ? true : false;
          export {};
        `,
      }),
      [],
    );
  });

  test('reads both branches of a conditional type', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          type Yes = Readonly<{ yes: true }>;
          type No = Readonly<{ no: true }>;
          export type Choose<T> = T extends string ? Yes : No;
          export {};
        `,
      }),
      [
        { declaration: 'Choose', type: 'Yes' },
        { declaration: 'Choose', type: 'No' },
      ],
    );
  });

  test('leaves type parameters and other packages alone', async () => {
    assert.deepStrictEqual(
      await findingsIn({
        'dist/index.d.mts': dedent`
          export declare const id: <T>(value: T) => ReadonlyArray<T>;
        `,
      }),
      [],
    );
  });
});
