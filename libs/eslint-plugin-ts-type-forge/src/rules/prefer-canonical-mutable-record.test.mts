import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCanonicalMutableRecord } from './prefer-canonical-mutable-record.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  },
});

describe('prefer-canonical-mutable-record', () => {
  tester.run('prefer-canonical-mutable-record', preferCanonicalMutableRecord, {
    valid: [
      {
        name: 'accepts the canonical spelling',
        code: 'type A = MutableRecord<string, number>;',
      },
      {
        name: 'ignores `Mutable` applied to a non-record type',
        code: 'type A = Mutable<{ a: number }>;',
      },
      {
        name: 'ignores a bare `Record` (prefer-readonly-or-mutable-record owns it)',
        code: 'type A = Record<string, number>;',
      },
      {
        name: 'ignores a qualified `Mutable`',
        code: 'type A = Lib.Mutable<Record<string, number>>;',
      },
      {
        name: 'ignores a locally declared `Mutable`',
        code: dedent`
          type Mutable<T> = { -readonly [P in keyof T]?: T[P] };
          type A = Mutable<Record<string, number>>;
        `,
      },
      {
        name: 'ignores a `Mutable` imported from another module',
        code: dedent`
          import { type Mutable } from './my-types.mjs';
          type A = Mutable<Record<string, number>>;
        `,
      },
      {
        name: 'ignores a wrapped `Record` that is declared locally',
        code: dedent`
          type Record<K extends PropertyKey, V> = { readonly [P in K]: V };
          type A = Mutable<Record<string, number>>;
        `,
      },
      {
        name: 'stays silent when `MutableRecord` is bound to another module',
        code: dedent`
          import { type MutableRecord } from './my-types.mjs';
          type A = Mutable<Record<string, number>>;
        `,
      },
    ],
    invalid: [
      {
        name: 'rewrites `Mutable<Record<K, V>>`',
        code: 'type A = Mutable<Record<string, number>>;',
        output: dedent`
          import { type MutableRecord } from 'ts-type-forge';
          type A = MutableRecord<string, number>;
        `,
        errors: [
          {
            messageId: 'useMutableRecord',
            data: {
              original: 'Mutable<Record<string, number>>',
              replacement: 'MutableRecord<string, number>',
            },
          },
        ],
      },
      {
        name: 'rewrites `Mutable<ReadonlyRecord<K, V>>`',
        code: "type A = Mutable<ReadonlyRecord<'a' | 'b', number>>;",
        output: dedent`
          import { type MutableRecord } from 'ts-type-forge';
          type A = MutableRecord<'a' | 'b', number>;
        `,
        errors: [{ messageId: 'useMutableRecord' }],
      },
      {
        name: 'unwraps the redundant `Mutable<MutableRecord<K, V>>`',
        code: 'type A = Mutable<MutableRecord<string, number>>;',
        output: dedent`
          import { type MutableRecord } from 'ts-type-forge';
          type A = MutableRecord<string, number>;
        `,
        errors: [{ messageId: 'useMutableRecord' }],
      },
      {
        name: 'touches no import under the `global` import style',
        options: [{ importStyle: 'global' }],
        code: 'type A = Mutable<Record<string, number>>;',
        output: 'type A = MutableRecord<string, number>;',
        errors: [{ messageId: 'useMutableRecord' }],
      },
      {
        name: 'adds the import once for multiple rewrites',
        code: dedent`
          type A = Mutable<Record<string, number>>;
          type B = Mutable<ReadonlyRecord<string, boolean>>;
        `,
        output: dedent`
          import { type MutableRecord } from 'ts-type-forge';
          type A = MutableRecord<string, number>;
          type B = MutableRecord<string, boolean>;
        `,
        errors: [
          { messageId: 'useMutableRecord' },
          { messageId: 'useMutableRecord' },
        ],
      },
      {
        name: 'follows ts-type-forge import aliases on both sides',
        code: dedent`
          import { type Mutable as Mut, type MutableRecord as MRecord } from 'ts-type-forge';
          type A = Mut<Record<string, number>>;
        `,
        output: dedent`
          import { type Mutable as Mut, type MutableRecord as MRecord } from 'ts-type-forge';
          type A = MRecord<string, number>;
        `,
        errors: [
          {
            messageId: 'useMutableRecord',
            data: {
              original: 'Mut<Record<string, number>>',
              replacement: 'MRecord<string, number>',
            },
          },
        ],
      },
      {
        name: 'rewrites the outer occurrence first when nested',
        options: [{ importStyle: 'global' }],
        code: 'type A = Mutable<Record<string, Mutable<Record<string, number>>>>;',
        // The two fixes overlap, so the first pass applies only the outer one
        // and the next pass reaches the fixed point.
        output: [
          'type A = MutableRecord<string, Mutable<Record<string, number>>>;',
          'type A = MutableRecord<string, MutableRecord<string, number>>;',
        ],
        errors: [
          { messageId: 'useMutableRecord' },
          { messageId: 'useMutableRecord' },
        ],
      },
      {
        name: 'rewrites inside a larger type',
        options: [{ importStyle: 'global' }],
        code: 'type A = readonly Mutable<Record<string, number>>[];',
        output: 'type A = readonly MutableRecord<string, number>[];',
        errors: [{ messageId: 'useMutableRecord' }],
      },
    ],
  });
});
