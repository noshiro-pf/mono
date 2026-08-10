/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import { replaceRecordWithUnknownRecordTransformer } from './replace-record-with-unknown-record.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

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

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

describe(replaceRecordWithUnknownRecordTransformer, () => {
  test.each([
    {
      name: 'Simple Record<string, unknown> with import added',
      source: 'type Foo = Record<string, unknown>;',
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
      `,
    },
    {
      name: 'Readonly<Record<string, unknown>>',
      source: 'type Foo = Readonly<Record<string, unknown>>;',
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
      `,
    },
    {
      name: 'Type literal { [k: string]: unknown }',
      source: 'type Foo = { [k: string]: unknown };',
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
      `,
    },
    {
      name: 'Readonly type literal Readonly<{ [k: string]: unknown }>',
      source: 'type Foo = Readonly<{ [k: string]: unknown }>;',
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
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
        import { type UnknownRecord } from 'ts-type-forge';

        export type Foo = UnknownRecord;
      `,
    },
    {
      name: 'Non-exported interface with only [k: string]: unknown preserves missing export',
      source: dedent`
        interface Foo {
          [k: string]: unknown;
        }
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = UnknownRecord;
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
        import { type UnknownRecord } from 'ts-type-forge';

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
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo =
          | readonly [
              'always',
              Readonly<{
                patternOptions?: UnknownRecord;
              }>,
            ];
      `,
    },
    {
      name: 'Record nested under readonly array (regression: TypeOperator)',
      source: dedent`
        type Foo = Readonly<{
          forbid?: readonly (string | Record<string, unknown>)[];
        }>;
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = Readonly<{
          forbid?: readonly (string | UnknownRecord)[];
        }>;
      `,
    },
    {
      name: 'readonly Readonly<Record<...>>[] at type alias root (regression)',
      source: 'type Foo = readonly Readonly<Record<string, unknown>>[];',
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = readonly UnknownRecord[];
      `,
    },
    {
      name: 'Record inside namespace',
      source: dedent`
        namespace Ns {
          export type Foo = Record<string, unknown>;
        }
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        namespace Ns {
          export type Foo = UnknownRecord;
        }
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
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        namespace Ns {
          export type Options = Readonly<{
            targets: string | readonly unknown[] | UnknownRecord;
          }>;
        }
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
        import { type UnknownRecord } from 'ts-type-forge';

        type Foo = Record<string, unknown>;
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

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
      `,
      expected: dedent`
        import { type UnknownRecord } from 'ts-type-forge';

        // transformer-ignore-next-line replace-record-with-unknown-record
        type A = Record<string, unknown>;
        type B = UnknownRecord;
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
  ])('$name', testFn);
});
