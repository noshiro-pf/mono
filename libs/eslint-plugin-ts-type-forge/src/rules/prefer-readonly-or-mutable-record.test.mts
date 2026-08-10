import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferReadonlyOrMutableRecord } from './prefer-readonly-or-mutable-record.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  },
});

describe('prefer-readonly-or-mutable-record', () => {
  tester.run(
    'prefer-readonly-or-mutable-record',
    preferReadonlyOrMutableRecord,
    {
      valid: [
        {
          name: 'accepts the ts-type-forge counterparts',
          code: dedent`
            type A = ReadonlyRecord<string, number>;
            type B = MutableRecord<'a' | 'b', number>;
          `,
        },
        {
          name: 'ignores unrelated standard-library types',
          code: 'type A = Readonly<Partial<{ a: 1 }>>;',
        },
        {
          name: 'ignores a qualified name that merely ends in `Record`',
          code: 'type A = Lib.Record<string, number>;',
        },
        {
          name: 'ignores a locally declared type of the same name',
          code: dedent`
            type Record<K extends PropertyKey, V> = { readonly [P in K]: V };
            type A = Record<string, number>;
          `,
        },
        {
          name: 'ignores a name imported from another module',
          code: dedent`
            import { type Record } from './my-types.mjs';
            type A = Record<string, number>;
          `,
        },
      ],
      invalid: [
        {
          name: 'reports `Record` and suggests both counterparts',
          code: 'type A = Record<string, number>;',
          errors: [
            {
              messageId: 'useReadonlyOrMutableRecord',
              data: {
                name: 'Record',
                alternatives: '`ReadonlyRecord` or `MutableRecord`',
              },
              suggestions: [
                {
                  messageId: 'replaceWith',
                  data: { name: 'Record', replacement: 'ReadonlyRecord' },
                  output: dedent`
                    import { type ReadonlyRecord } from 'ts-type-forge';
                    type A = ReadonlyRecord<string, number>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  data: { name: 'Record', replacement: 'MutableRecord' },
                  output: dedent`
                    import { type MutableRecord } from 'ts-type-forge';
                    type A = MutableRecord<string, number>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'touches no import under the `global` import style',
          options: [{ importStyle: 'global' }],
          code: 'type A = Record<string, number>;',
          errors: [
            {
              messageId: 'useReadonlyOrMutableRecord',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: 'type A = ReadonlyRecord<string, number>;',
                },
                {
                  messageId: 'replaceWith',
                  output: 'type A = MutableRecord<string, number>;',
                },
              ],
            },
          ],
        },
        {
          name: 'reuses an existing ts-type-forge import, alias included',
          code: dedent`
            import { type ReadonlyRecord as RRecord } from 'ts-type-forge';
            type A = Record<string, number>;
          `,
          errors: [
            {
              messageId: 'useReadonlyOrMutableRecord',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  data: { name: 'Record', replacement: 'RRecord' },
                  output: dedent`
                    import { type ReadonlyRecord as RRecord } from 'ts-type-forge';
                    type A = RRecord<string, number>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  data: { name: 'Record', replacement: 'MutableRecord' },
                  output: dedent`
                    import { type MutableRecord } from 'ts-type-forge';
                    import { type ReadonlyRecord as RRecord } from 'ts-type-forge';
                    type A = MutableRecord<string, number>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'reports `Record` in a type-parameter constraint too',
          code: 'type A<T extends Record<string, unknown>> = keyof T;',
          errors: [
            {
              messageId: 'useReadonlyOrMutableRecord',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type ReadonlyRecord } from 'ts-type-forge';
                    type A<T extends ReadonlyRecord<string, unknown>> = keyof T;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type MutableRecord } from 'ts-type-forge';
                    type A<T extends MutableRecord<string, unknown>> = keyof T;
                  `,
                },
              ],
            },
          ],
        },
      ],
    },
  );
});
