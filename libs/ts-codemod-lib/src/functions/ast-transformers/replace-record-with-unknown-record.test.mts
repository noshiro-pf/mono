/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import { replaceRecordWithUnknownRecordTransformer } from './replace-record-with-unknown-record.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

const testFn = async ({
  source,
  expected,
}: Readonly<{
  source: string;
  expected: string;
}>): Promise<void> => {
  const transformed = await formatter(
    transformSourceCode(source, false, [
      replaceRecordWithUnknownRecordTransformer(),
    ]),
  );

  const expectedFormatted = await formatter(expected);

  expect(transformed).toBe(expectedFormatted);
};

describe(replaceRecordWithUnknownRecordTransformer, () => {
  test.each([
    {
      name: 'Simple Record<string, unknown> with import added',
      source: 'type Foo = Record<string, unknown>;\n\nexport {};',
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;

        export {};
      `,
    },
    {
      name: 'Readonly<Record<string, unknown>>',
      source: 'type Foo = Readonly<Record<string, unknown>>;\n\nexport {};',
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;

        export {};
      `,
    },
    {
      name: 'Type literal { [k: string]: unknown }',
      source: 'type Foo = { [k: string]: unknown };\n\nexport {};',
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;

        export {};
      `,
    },
    {
      name: 'Readonly type literal Readonly<{ [k: string]: unknown }>',
      source: 'type Foo = Readonly<{ [k: string]: unknown }>;\n\nexport {};',
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;

        export {};
      `,
    },
    {
      name: 'Exported interface with only [k: string]: unknown',
      source: dedent`
        export interface Foo {
          [k: string]: unknown;
        }
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        export type Foo = UnknownRecord;
      `,
    },
    {
      name: 'Non-exported interface with only [k: string]: unknown preserves missing export',
      source: dedent`
        interface Foo {
          [k: string]: unknown;
        }

        export {};
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;

        export {};
      `,
    },
    {
      name: 'Generic interface with [k: string]: unknown is left untouched',
      source: dedent`
        export interface Foo<T> {
          [k: string]: unknown;
        }
      `,
      expected: dedent`
        export interface Foo<T> {
          [k: string]: unknown;
        }
      `,
    },
    {
      name: 'Interface with extends + [k: string]: unknown is left untouched',
      source: dedent`
        interface Bar {
          a: number;
        }
        export interface Foo extends Bar {
          [k: string]: unknown;
        }
      `,
      expected: dedent`
        interface Bar {
          a: number;
        }
        export interface Foo extends Bar {
          [k: string]: unknown;
        }
      `,
    },
    {
      name: 'declare interface with [k: string]: unknown is left untouched',
      source: dedent`
        declare interface Foo {
          [k: string]: unknown;
        }
      `,
      expected: dedent`
        declare interface Foo {
          [k: string]: unknown;
        }
      `,
    },
    {
      name: 'Generic interface still has its property types transformed',
      source: dedent`
        export interface Foo<T> {
          value: Record<string, unknown>;
          tag: T;
        }
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        export interface Foo<T> {
          value: UnknownRecord;
          tag: T;
        }
      `,
    },
    {
      name: 'Record nested under readonly tuple (regression: TypeOperator)',
      source: dedent`
        type Foo =
          | readonly [
              'always',
              Readonly<{
                patternOptions?: Readonly<Record<string, unknown>>;
              }>,
            ];

        export {};
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo =
          | readonly [
              'always',
              Readonly<{
                patternOptions?: UnknownRecord;
              }>,
            ];

        export {};
      `,
    },
    {
      name: 'Record nested under readonly array (regression: TypeOperator)',
      source: dedent`
        type Foo = Readonly<{
          forbid?: readonly (string | Record<string, unknown>)[];
        }>;

        export {};
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = Readonly<{
          forbid?: readonly (string | UnknownRecord)[];
        }>;

        export {};
      `,
    },
    {
      name: 'readonly Readonly<Record<...>>[] at type alias root (regression)',
      source:
        'type Foo = readonly Readonly<Record<string, unknown>>[];\n\nexport {};',
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = readonly UnknownRecord[];

        export {};
      `,
    },
    {
      name: 'Record inside namespace',
      source: dedent`
        namespace Ns {
          export type Foo = Record<string, unknown>;
        }

        export {};
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        namespace Ns {
          export type Foo = UnknownRecord;
        }

        export {};
      `,
    },
    {
      name: 'Record nested in union inside namespace',
      source: dedent`
        namespace Ns {
          export type Options = Readonly<{
            targets:
              | string
              | readonly unknown[]
              | Readonly<Record<string, unknown>>;
          }>;
        }

        export {};
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        namespace Ns {
          export type Options = Readonly<{
            targets: string | readonly unknown[] | UnknownRecord;
          }>;
        }

        export {};
      `,
    },
    {
      name: 'No transformation -> no import added',
      source: 'type Foo = string;',
      expected: 'type Foo = string;',
    },
    {
      name: 'Existing UnknownRecord import is not duplicated',
      source: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
      `,
    },
    {
      name: 'Merged into existing ts-type-forge import with other names',
      source: dedent`
        import { type DeepReadonly } from 'ts-type-forge';

        type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        import { type DeepReadonly, type UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
      `,
    },
    {
      name: 'Disable comment skips the type alias and does not add import',
      source: dedent`
        // transformer-ignore-next-line
        type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        // transformer-ignore-next-line
        type Foo = Record<string, unknown>;
      `,
    },
    {
      name: 'Transformer-specific disable comment is respected',
      source: dedent`
        // transformer-ignore-next-line replace-record-with-unknown-record
        type A = Record<string, unknown>;
        type B = Record<string, unknown>;

        export {};
      `,
      expected: dedent`
        import type { UnknownRecord } from 'ts-type-forge';

        // transformer-ignore-next-line replace-record-with-unknown-record
        type A = Record<string, unknown>;
        type B = UnknownRecord;

        export {};
      `,
    },
    {
      name: 'Record<string, string> (non-unknown value) is left alone',
      source: 'type Foo = Record<string, string>;',
      expected: 'type Foo = Record<string, string>;',
    },
    {
      name: 'Record<number, unknown> (non-string key) is left alone',
      source: 'type Foo = Record<number, unknown>;',
      expected: 'type Foo = Record<number, unknown>;',
    },
    {
      name: 'A new import goes after the last import',
      source: dedent`
        import { foo } from './foo.mjs';

        type Foo = Record<string, typeof foo>;
        type Bar = Record<string, unknown>;
      `,
      expected: dedent`
        import { foo } from './foo.mjs';
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = Record<string, typeof foo>;
        type Bar = UnknownRecord;
      `,
    },
    {
      // An import would make the file a module, and its global declarations
      // would stop being global.
      name: 'A script is left alone',
      source: dedent`
        interface Window {
          x: Record<string, unknown>;
        }
      `,
      expected: dedent`
        interface Window {
          x: Record<string, unknown>;
        }
      `,
    },
    {
      name: 'An UnknownRecord the file already imports is written with no new import',
      source: dedent`
        import type { UnknownRecord } from './types.mjs';

        export type Foo = Record<string, unknown>;
        export type Bar = UnknownRecord;
      `,
      expected: dedent`
        import type { UnknownRecord } from './types.mjs';

        export type Foo = UnknownRecord;
        export type Bar = UnknownRecord;
      `,
    },
    {
      name: 'A file that binds UnknownRecord to a value is left alone',
      source: dedent`
        export const UnknownRecord = 1;

        export type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        export const UnknownRecord = 1;

        export type Foo = Record<string, unknown>;
      `,
    },
    {
      name: 'A new import goes after the directive prologue',
      source: dedent`
        'use client';

        export type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        'use client';
        import type { UnknownRecord } from 'ts-type-forge';

        export type Foo = UnknownRecord;
      `,
    },
    {
      // `import type { X, type UnknownRecord }` is an error.
      name: 'Merged into an import type without a type modifier',
      source: dedent`
        import type { DeepReadonly } from 'ts-type-forge';

        type Foo = DeepReadonly<Record<string, unknown>>;
      `,
      expected: dedent`
        import type { DeepReadonly, UnknownRecord } from 'ts-type-forge';

        type Foo = DeepReadonly<UnknownRecord>;
      `,
    },
    {
      name: 'An import type is preferred over an earlier value import as the host',
      source: dedent`
        import { foo } from 'ts-type-forge';
        import type { DeepReadonly } from 'ts-type-forge';

        type Foo = DeepReadonly<Record<string, typeof foo>> | Record<string, unknown>;
      `,
      expected: dedent`
        import { foo } from 'ts-type-forge';
        import type { DeepReadonly, UnknownRecord } from 'ts-type-forge';

        type Foo = DeepReadonly<Record<string, typeof foo>> | UnknownRecord;
      `,
    },
    {
      name: 'A namespace import gets a new import beside it',
      source: dedent`
        import type * as tf from 'ts-type-forge';

        type Foo = tf.DeepReadonly<{ a: 1 }> | Record<string, unknown>;
      `,
      expected: dedent`
        import type * as tf from 'ts-type-forge';
        import type { UnknownRecord } from 'ts-type-forge';

        type Foo = tf.DeepReadonly<{ a: 1 }> | UnknownRecord;
      `,
    },
    {
      name: 'An existing inline type specifier is not duplicated',
      source: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
      `,
    },
    {
      name: 'A self-aliased import binds the name',
      source: dedent`
        import type { UnknownRecord as UnknownRecord } from 'ts-type-forge';

        type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        import type { UnknownRecord as UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
      `,
    },
    {
      name: 'An aliased import does not bind the name',
      source: dedent`
        import type { UnknownRecord as UR } from 'ts-type-forge';

        type Foo = UR | Record<string, unknown>;
      `,
      expected: dedent`
        import type { UnknownRecord as UR, UnknownRecord } from 'ts-type-forge';

        type Foo = UR | UnknownRecord;
      `,
    },
  ])('$name', testFn);

  const transform = (source: string): string =>
    transformSourceCode(source, false, [
      replaceRecordWithUnknownRecordTransformer(),
    ]);

  test('a shebang stays the first line', () => {
    const source = dedent`
      #!/usr/bin/env node
      export type Foo = Record<string, unknown>;
    `;

    expect(transform(source)).toBe(dedent`
      #!/usr/bin/env node
      import type { UnknownRecord } from 'ts-type-forge';

      export type Foo = UnknownRecord;
    `);
  });

  test('a new import takes the quotes of the last import', () => {
    expect(
      transform(dedent`
        import { a } from "./a.mjs";
        type Foo = Record<string, typeof a> | Record<string, unknown>;
      `),
    ).toContain('import type { UnknownRecord } from "ts-type-forge";');
  });

  test('a new import takes the quotes of the directive prologue', () => {
    expect(
      transform(dedent`
        "use client";
        export type Foo = Record<string, unknown>;
      `),
    ).toContain('import type { UnknownRecord } from "ts-type-forge";');
  });

  test.each([
    'export type Foo = Record<string, unknown>;\r\n',
    "import { foo } from './foo.mjs';\r\ntype Foo = Record<string, typeof foo> | Record<string, unknown>;\r\n",
  ])('an import takes the CRLF line breaks of the file: %j', (source) => {
    const output = transform(source);

    expect(output).toMatch(/\bUnknownRecord\b.*\} from 'ts-type-forge'/u);

    expect(output).not.toMatch(/(?<!\r)\n/u);
  });

  test('a name merged into a multi-line import takes its own CRLF line', () => {
    expect(
      transform(
        "import {\r\n  type DeepReadonly,\r\n} from 'ts-type-forge';\r\ntype Foo = DeepReadonly<Record<string, unknown>>;\r\n",
      ),
    ).toBe(
      "import {\r\n  type DeepReadonly,\r\n  type UnknownRecord,\r\n} from 'ts-type-forge';\r\ntype Foo = DeepReadonly<UnknownRecord>;\r\n",
    );
  });
});
