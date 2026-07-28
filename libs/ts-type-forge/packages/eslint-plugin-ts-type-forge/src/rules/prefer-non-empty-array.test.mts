import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferNonEmptyArray } from './prefer-non-empty-array.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('prefer-non-empty-array', () => {
  tester.run('prefer-non-empty-array', preferNonEmptyArray, {
    valid: [
      {
        name: 'ignores mutable tuples (that spelling is MutableNonEmptyArray)',
        code: 'type T = [number, ...number[]];',
      },
      {
        name: 'ignores plain readonly arrays',
        code: 'type T = readonly number[];',
      },
      {
        name: 'ignores tuples whose rest element type differs from the head',
        code: 'type T = readonly [string, ...number[]];',
      },
      {
        name: 'ignores min-length-2 tuples',
        code: 'type T = readonly [number, number, ...number[]];',
      },
      {
        name: 'ignores fixed-length tuples',
        code: 'type T = readonly [number];',
      },
      {
        name: 'ignores leading-rest tuples',
        code: 'type T = readonly [...number[], number];',
      },
      {
        name: 'ignores optional heads',
        code: 'type T = readonly [number?, ...number[]];',
      },
      {
        name: 'ignores labelled tuple members (the labels would be lost)',
        code: 'type T = readonly [head: number, ...tail: number[]];',
      },
      {
        name: 'ignores readonly operators applied to non-tuples',
        code: 'type T = readonly string[];',
      },
      {
        name: 'stays silent when NonEmptyArray is declared locally',
        code: dedent`
          type NonEmptyArray<A> = readonly [A, ...A[]];
          type T = readonly [number, ...number[]];
        `,
      },
      {
        name: 'stays silent when NonEmptyArray is exported locally',
        code: 'export type NonEmptyArray<A> = readonly [A, ...A[]];',
      },
      {
        name: 'stays silent when NonEmptyArray is imported from elsewhere',
        code: dedent`
          import { type NonEmptyArray } from './my-types.mjs';

          type T = readonly [number, ...number[]];
          type U = NonEmptyArray<string>;
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces readonly [V, ...V[]] with NonEmptyArray<V>',
        code: 'type T = readonly [number, ...number[]];',
        output: 'type T = NonEmptyArray<number>;',
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'replaces readonly [V, ...(readonly V[])] with NonEmptyArray<V>',
        code: 'type T = readonly [number, ...(readonly number[])];',
        output: 'type T = NonEmptyArray<number>;',
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'keeps a composite element type intact',
        code: 'type T = readonly [string | number, ...(string | number)[]];',
        output: 'type T = NonEmptyArray<string | number>;',
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'handles generic element types',
        code: 'type T<A> = readonly [A, ...A[]];',
        output: 'type T<A> = NonEmptyArray<A>;',
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'rewrites occurrences nested inside another tuple',
        code: 'type T = readonly [readonly [number, ...number[]], ...string[]];',
        output: 'type T = readonly [NonEmptyArray<number>, ...string[]];',
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'rewrites parameter and return type positions',
        code: dedent`
          declare const f: (xs: readonly [number, ...number[]]) => readonly [string, ...string[]];
        `,
        output: dedent`
          declare const f: (xs: NonEmptyArray<number>) => NonEmptyArray<string>;
        `,
        errors: [
          { messageId: 'useNonEmptyArray' },
          { messageId: 'useNonEmptyArray' },
        ],
      },
      {
        name: 'reuses the local alias when NonEmptyArray is imported aliased',
        code: dedent`
          import { type NonEmptyArray as NEA } from 'ts-type-forge';

          type T = readonly [number, ...number[]];
        `,
        output: dedent`
          import { type NonEmptyArray as NEA } from 'ts-type-forge';

          type T = NEA<number>;
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'does not add an import with the default (global) import style',
        code: dedent`
          import { type StrictOmit } from 'ts-type-forge';

          type T = readonly [number, ...number[]];
        `,
        output: dedent`
          import { type StrictOmit } from 'ts-type-forge';

          type T = NonEmptyArray<number>;
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'adds the named import when importStyle is "named"',
        options: [{ importStyle: 'named' }],
        code: 'type T = readonly [number, ...number[]];',
        output: dedent`
          import { type NonEmptyArray } from 'ts-type-forge';
          type T = NonEmptyArray<number>;
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
      {
        name: 'adds the named import only once per file',
        options: [{ importStyle: 'named' }],
        code: dedent`
          type T = readonly [number, ...number[]];
          type U = readonly [string, ...string[]];
        `,
        output: dedent`
          import { type NonEmptyArray } from 'ts-type-forge';
          type T = NonEmptyArray<number>;
          type U = NonEmptyArray<string>;
        `,
        errors: [
          { messageId: 'useNonEmptyArray' },
          { messageId: 'useNonEmptyArray' },
        ],
      },
      {
        name: 'keeps an existing NonEmptyArray import untouched',
        options: [{ importStyle: 'named' }],
        code: dedent`
          import { type NonEmptyArray } from 'ts-type-forge';

          type T = readonly [number, ...number[]];
        `,
        output: dedent`
          import { type NonEmptyArray } from 'ts-type-forge';

          type T = NonEmptyArray<number>;
        `,
        errors: [{ messageId: 'useNonEmptyArray' }],
      },
    ],
  });
});
