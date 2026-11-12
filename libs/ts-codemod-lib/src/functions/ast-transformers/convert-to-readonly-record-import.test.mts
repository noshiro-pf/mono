/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import * as tsm from 'ts-morph';
import {
  convertToReadonlyTransformer,
  type ReadonlyTransformerOptions,
} from './convert-to-readonly.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

const transform = (
  source: string,
  options?: ReadonlyTransformerOptions,
): string =>
  transformSourceCode(source, false, [convertToReadonlyTransformer(options)]);

const testFn = async ({
  source,
  expected,
  options,
}: Readonly<{
  source: string;
  expected: string;
  options?: ReadonlyTransformerOptions;
}>): Promise<void> => {
  await expect(formatter(transform(source, options))).resolves.toBe(
    await formatter(expected),
  );
};

/**
 * The diagnostics of `code` compiled as a module beside a stand-in for
 * `ts-type-forge` that declares `ReadonlyRecord` as a named export only — no
 * global, as in a package that does not load `ts-type-forge/global`.
 */
const diagnosticsOf = (code: string): readonly string[] => {
  const project = new tsm.Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      strict: true,
      noEmit: true,
      target: tsm.ts.ScriptTarget.ESNext,
      module: tsm.ts.ModuleKind.ESNext,
      moduleResolution: tsm.ts.ModuleResolutionKind.Bundler,
    },
  });

  project.createSourceFile(
    '/node_modules/ts-type-forge/index.d.ts',
    'export type ReadonlyRecord<K extends PropertyKey, V> = Readonly<Record<K, V>>;',
  );

  project.createSourceFile(
    '/node_modules/ts-type-forge/package.json',
    '{ "name": "ts-type-forge", "types": "./index.d.ts" }',
  );

  const sourceFile = project.createSourceFile('/src/source.ts', code);

  return project
    .getPreEmitDiagnostics()
    .filter(
      (d) => d.getSourceFile()?.getFilePath() === sourceFile.getFilePath(),
    )
    .map((d) =>
      tsm.ts.flattenDiagnosticMessageText(d.compilerObject.messageText, '\n'),
    );
};

describe('convertToReadonlyTransformer imports the ReadonlyRecord it writes', () => {
  test('the output of a module without the import type-checks', () => {
    const source = dedent`
      export const probe = (x: Record<string, number>): number => x['a'] ?? 0;
    `;

    // The premise: without the import, the name does not resolve.
    expect(
      diagnosticsOf(source.replace('Record<', 'ReadonlyRecord<')),
    ).not.toStrictEqual([]);

    const output = transform(source);

    expect(output).toMatch(/ReadonlyRecord<string,\s*number>/u);

    assert.deepStrictEqual(diagnosticsOf(output), []);
  });

  test('the output of a script type-checks and is still a script', () => {
    const output = transform(dedent`
      type Foo = Record<string, number>;
      const foo: Foo = { a: 1 };
    `);

    assert.deepStrictEqual(diagnosticsOf(output), []);

    expect(output).not.toContain('import');
  });

  test.each([
    "import { foo } from './foo.mjs';\r\nexport type Foo = Record<string, typeof foo>;\r\n",
    'export type Foo = Record<string, number>;\r\n',
  ])('an import takes the CRLF line breaks of the file: %j', (source) => {
    const output = transform(source);

    expect(output).toMatch(/\bReadonlyRecord\b.*\} from 'ts-type-forge'/u);

    expect(output).not.toMatch(/[^\r]\n/u);
  });

  test('a name merged into a multi-line import takes its own CRLF line', () => {
    // Only the import is pinned: how the union below it is reprinted is #3259.
    expect(
      transform(
        "import type {\r\n  DeepReadonly,\r\n} from 'ts-type-forge';\r\nexport type Foo = DeepReadonly<{ a: 1 }> | Record<string, number>;\r\n",
      ),
    ).toMatch(
      /^import type \{\r\n {2}DeepReadonly,\r\n {2}ReadonlyRecord,\r\n\} from 'ts-type-forge';\r\n/u,
    );
  });

  test.each([
    {
      name: 'A new import is added when the file has none',
      source: dedent`
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        import type { ReadonlyRecord } from 'ts-type-forge';

        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      // An import would make it a module, and its declarations would stop being
      // global (a `global.d.ts`).
      name: 'A script gets Readonly<Record<K, V>> rather than an import',
      source: dedent`
        type Foo = Record<string, number>;
        declare module 'x' {
          type Bar = Record<string, number>;
        }
      `,
      expected: dedent`
        type Foo = Readonly<Record<string, number>>;
        declare module 'x' {
          type Bar = Readonly<Record<string, number>>;
        }
      `,
    },
    {
      name: 'A script already using ReadonlyRecord keeps the style',
      source: dedent`
        type Foo = ReadonlyRecord<string, number> | Record<string, number>;
      `,
      expected: dedent`
        type Foo = ReadonlyRecord<string, number> | ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'A new import goes after the directive prologue',
      source: dedent`
        'use client'; // a comment on its line

        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        'use client'; // a comment on its line
        import type { ReadonlyRecord } from 'ts-type-forge';

        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'A pragma comment stays above a new import',
      source: dedent`
        // @ts-nocheck
        /** @jsxImportSource preact */
        /** Foo. */
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        // @ts-nocheck
        /** @jsxImportSource preact */
        import type { ReadonlyRecord } from 'ts-type-forge';

        /** Foo. */
        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'A block comment directly above the first statement stays above a new import',
      source: dedent`
        /* eslint-disable some-rule */
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        /* eslint-disable some-rule */
        import type { ReadonlyRecord } from 'ts-type-forge';

        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'ReadonlyRecord declared in an inner scope does not count',
      source: dedent`
        export function f(): void {
          type ReadonlyRecord = number;
        }
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        import type { ReadonlyRecord } from 'ts-type-forge';

        export function f(): void {
          type ReadonlyRecord = number;
        }
        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'A top-level value named ReadonlyRecord gets Readonly<Record<K, V>> rather than a clashing import',
      source: dedent`
        export const ReadonlyRecord = 1;
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        export const ReadonlyRecord = 1;
        export type Foo = Readonly<Record<string, number>>;
      `,
    },
    {
      name: 'A namespace import named ReadonlyRecord gets Readonly<Record<K, V>>',
      source: dedent`
        import * as ReadonlyRecord from './x.mjs';
        export type Foo = Record<string, typeof ReadonlyRecord>;
      `,
      expected: dedent`
        import * as ReadonlyRecord from './x.mjs';
        export type Foo = Readonly<Record<string, typeof ReadonlyRecord>>;
      `,
    },
    {
      name: 'ReadonlyRecord as a qualified name or a property is not a binding',
      source: dedent`
        import * as tf from 'ts-type-forge';
        export type A = tf.ReadonlyRecord<string, 1> | { ReadonlyRecord: true };
        export type B = Record<string, 2>;
      `,
      expected: dedent`
        import * as tf from 'ts-type-forge';
        import type { ReadonlyRecord } from 'ts-type-forge';
        export type A = tf.ReadonlyRecord<string, 1> | Readonly<{ ReadonlyRecord: true }>;
        export type B = ReadonlyRecord<string, 2>;
      `,
    },
    {
      name: 'A new import goes after the other imports',
      source: dedent`
        import { foo } from './foo.mjs';
        import { bar } from './bar.mjs';

        export type Foo = Record<string, typeof foo | typeof bar>;
      `,
      expected: dedent`
        import { foo } from './foo.mjs';
        import { bar } from './bar.mjs';
        import type { ReadonlyRecord } from 'ts-type-forge';

        export type Foo = ReadonlyRecord<string, typeof foo | typeof bar>;
      `,
    },
    {
      name: 'A new import goes after a comment on the line of the last import',
      source: dedent`
        import { foo } from './foo.mjs'; // eslint-disable-line some-rule

        export type Foo = Record<string, typeof foo>;
      `,
      expected: dedent`
        import { foo } from './foo.mjs'; // eslint-disable-line some-rule
        import type { ReadonlyRecord } from 'ts-type-forge';

        export type Foo = ReadonlyRecord<string, typeof foo>;
      `,
    },
    {
      name: 'A shebang, a header comment and a triple-slash directive stay above a new import',
      source: dedent`
        #!/usr/bin/env node
        /* cSpell:disable */
        /// <reference types="node" />
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        #!/usr/bin/env node
        /* cSpell:disable */
        /// <reference types="node" />
        import type { ReadonlyRecord } from 'ts-type-forge';

        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'The comments attached to the first statement stay with it',
      source: dedent`
        /* A file header */

        /** Foo. */
        // eslint-disable-next-line some-rule
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        /* A file header */

        import type { ReadonlyRecord } from 'ts-type-forge';

        /** Foo. */
        // eslint-disable-next-line some-rule
        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'Merged into an existing type-only import of ts-type-forge',
      source: dedent`
        import type { DeepReadonly } from 'ts-type-forge';
        export type Foo = DeepReadonly<Record<string, number[]>> | Record<string, number>;
      `,
      expected: dedent`
        import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
        export type Foo = DeepReadonly<Record<string, number[]>> | ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'Merged into an existing import of ts-type-forge with inline type',
      source: dedent`
        import { type DeepReadonly } from 'ts-type-forge';
        export type Foo = DeepReadonly<Record<string, number[]>> | Record<string, number>;
      `,
      expected: dedent`
        import { type DeepReadonly, type ReadonlyRecord } from 'ts-type-forge';
        export type Foo = DeepReadonly<Record<string, number[]>> | ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'A namespace import of ts-type-forge is left alone and a new import added',
      source: dedent`
        import type * as TTF from 'ts-type-forge';
        export type Foo = TTF.UnknownRecord | Record<string, number>;
      `,
      expected: dedent`
        import type * as TTF from 'ts-type-forge';
        import type { ReadonlyRecord } from 'ts-type-forge';
        export type Foo = TTF.UnknownRecord | ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'An aliased import does not bind the name, so it is imported',
      source: dedent`
        import type { ReadonlyRecord as RR } from 'ts-type-forge';
        export type Foo = RR<string, number> | Record<string, number>;
      `,
      expected: dedent`
        import type { ReadonlyRecord as RR, ReadonlyRecord } from 'ts-type-forge';
        export type Foo = RR<string, number> | ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'An existing import of ReadonlyRecord is not duplicated',
      source: dedent`
        import type { ReadonlyRecord } from 'ts-type-forge';
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        import type { ReadonlyRecord } from 'ts-type-forge';
        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'ReadonlyRecord imported from another module is used as is',
      source: dedent`
        import type { ReadonlyRecord } from './types.mjs';
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        import type { ReadonlyRecord } from './types.mjs';
        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'A file declaring ReadonlyRecord itself gets no import',
      source: dedent`
        type ReadonlyRecord<K extends PropertyKey, V> = { readonly [P in K]: V };
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        type ReadonlyRecord<K extends PropertyKey, V> = Readonly<{ [P in K]: V }>;
        export type Foo = ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'A file already using ReadonlyRecord without an import (a global) gets no import',
      source: dedent`
        export type Foo = ReadonlyRecord<string, number> | Record<string, number>;
      `,
      expected: dedent`
        export type Foo = ReadonlyRecord<string, number> | ReadonlyRecord<string, number>;
      `,
    },
    {
      name: 'No Record written, no import',
      source: dedent`
        export type Foo = Map<string, number>;
      `,
      expected: dedent`
        export type Foo = ReadonlyMap<string, number>;
      `,
    },
    {
      name: 'A Record kept as is writes no import',
      source: dedent`
        export type Foo = DeepReadonly<Record<string, number>>;
      `,
      expected: dedent`
        export type Foo = DeepReadonly<Record<string, number>>;
      `,
    },
    {
      name: 'A Record skipped by an ignore comment writes no import',
      source: dedent`
        // transformer-ignore-next-line
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        // transformer-ignore-next-line
        export type Foo = Record<string, number>;
      `,
    },
    {
      name: 'recordStyle "Readonly<Record>" writes no import',
      source: dedent`
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        export type Foo = Readonly<Record<string, number>>;
      `,
      options: { recordStyle: 'Readonly<Record>' },
    },
    {
      name: 'importStyle "global" writes no import',
      source: dedent`
        export type Foo = Record<string, number>;
      `,
      expected: dedent`
        export type Foo = ReadonlyRecord<string, number>;
      `,
      options: { importStyle: 'global' },
    },
  ] as const)('$name', testFn);
});
