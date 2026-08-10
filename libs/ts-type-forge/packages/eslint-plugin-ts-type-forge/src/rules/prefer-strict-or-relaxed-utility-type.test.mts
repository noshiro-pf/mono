import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferStrictOrRelaxedUtilityType } from './prefer-strict-or-relaxed-utility-type.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  },
});

describe('prefer-strict-or-relaxed-utility-type', () => {
  tester.run(
    'prefer-strict-or-relaxed-utility-type',
    preferStrictOrRelaxedUtilityType,
    {
      valid: [
        {
          name: 'accepts the ts-type-forge counterparts',
          code: dedent`
            type A = StrictExclude<'a' | 'b', 'a'>;
            type B = RelaxedExtract<string | number, number>;
            type C = StrictOmit<{ a: 1; b: 2 }, 'a'>;
            type D = RelaxedPick<{ a: 1; b: 2 }, 'a' | 'z'>;
          `,
        },
        {
          name: 'ignores unrelated standard-library types',
          code: 'type A = Partial<Required<{ a: 1 }>>;',
        },
        {
          name: 'ignores a qualified name that merely ends in a banned name',
          code: "type A = Utils.Pick<{ a: 1 }, 'a'>;",
        },
        {
          name: 'ignores a locally declared type of the same name',
          code: dedent`
            type Pick<T, K extends keyof T> = { readonly [P in K]: T[P] };
            type A = Pick<{ a: 1 }, 'a'>;
          `,
        },
        {
          name: 'ignores a name imported from another module',
          code: dedent`
            import { type Omit } from './my-types.mjs';
            type A = Omit<{ a: 1; b: 2 }, 'a'>;
          `,
        },
      ],
      invalid: [
        {
          name: 'reports `Exclude` and suggests both counterparts',
          code: "type A = Exclude<'a' | 'b', 'a'>;",
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              data: {
                name: 'Exclude',
                alternatives: '`StrictExclude` or `RelaxedExclude`',
              },
              suggestions: [
                {
                  messageId: 'replaceWith',
                  data: { name: 'Exclude', replacement: 'StrictExclude' },
                  output: dedent`
                    import { type StrictExclude } from 'ts-type-forge';
                    type A = StrictExclude<'a' | 'b', 'a'>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  data: { name: 'Exclude', replacement: 'RelaxedExclude' },
                  output: dedent`
                    import { type RelaxedExclude } from 'ts-type-forge';
                    type A = RelaxedExclude<'a' | 'b', 'a'>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'reports `Extract`',
          code: 'type A = Extract<string | number, number>;',
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type StrictExtract } from 'ts-type-forge';
                    type A = StrictExtract<string | number, number>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type RelaxedExtract } from 'ts-type-forge';
                    type A = RelaxedExtract<string | number, number>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'reports `Omit`',
          code: "type A = Omit<{ a: 1; b: 2 }, 'a'>;",
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type StrictOmit } from 'ts-type-forge';
                    type A = StrictOmit<{ a: 1; b: 2 }, 'a'>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type RelaxedOmit } from 'ts-type-forge';
                    type A = RelaxedOmit<{ a: 1; b: 2 }, 'a'>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'reports `Pick`',
          code: "type A = Pick<{ a: 1; b: 2 }, 'a'>;",
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type StrictPick } from 'ts-type-forge';
                    type A = StrictPick<{ a: 1; b: 2 }, 'a'>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type RelaxedPick } from 'ts-type-forge';
                    type A = RelaxedPick<{ a: 1; b: 2 }, 'a'>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'touches no import under the `global` import style',
          options: [{ importStyle: 'global' }],
          code: "type A = Pick<{ a: 1 }, 'a'>;",
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: "type A = StrictPick<{ a: 1 }, 'a'>;",
                },
                {
                  messageId: 'replaceWith',
                  output: "type A = RelaxedPick<{ a: 1 }, 'a'>;",
                },
              ],
            },
          ],
        },
        {
          name: 'reuses an existing ts-type-forge import, alias included',
          code: dedent`
            import { type StrictPick as SPick } from 'ts-type-forge';
            type A = Pick<{ a: 1 }, 'a'>;
          `,
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  data: { name: 'Pick', replacement: 'SPick' },
                  output: dedent`
                    import { type StrictPick as SPick } from 'ts-type-forge';
                    type A = SPick<{ a: 1 }, 'a'>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  data: { name: 'Pick', replacement: 'RelaxedPick' },
                  output: dedent`
                    import { type RelaxedPick } from 'ts-type-forge';
                    import { type StrictPick as SPick } from 'ts-type-forge';
                    type A = RelaxedPick<{ a: 1 }, 'a'>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'drops the suggestion whose target name is bound locally',
          code: dedent`
            type StrictOmit<T, K extends keyof T> = { readonly [P in K]: T[P] };
            type A = Omit<{ a: 1; b: 2 }, 'a'>;
          `,
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  data: { name: 'Omit', replacement: 'RelaxedOmit' },
                  output: dedent`
                    import { type RelaxedOmit } from 'ts-type-forge';
                    type StrictOmit<T, K extends keyof T> = { readonly [P in K]: T[P] };
                    type A = RelaxedOmit<{ a: 1; b: 2 }, 'a'>;
                  `,
                },
              ],
            },
          ],
        },
        {
          name: 'reports every occurrence, nesting included',
          code: "type A = Pick<{ a: 1; b: 2 }, Exclude<'a' | 'b', 'b'>>;",
          errors: [
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type StrictPick } from 'ts-type-forge';
                    type A = StrictPick<{ a: 1; b: 2 }, Exclude<'a' | 'b', 'b'>>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type RelaxedPick } from 'ts-type-forge';
                    type A = RelaxedPick<{ a: 1; b: 2 }, Exclude<'a' | 'b', 'b'>>;
                  `,
                },
              ],
            },
            {
              messageId: 'useStrictOrRelaxed',
              suggestions: [
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type StrictExclude } from 'ts-type-forge';
                    type A = Pick<{ a: 1; b: 2 }, StrictExclude<'a' | 'b', 'b'>>;
                  `,
                },
                {
                  messageId: 'replaceWith',
                  output: dedent`
                    import { type RelaxedExclude } from 'ts-type-forge';
                    type A = Pick<{ a: 1; b: 2 }, RelaxedExclude<'a' | 'b', 'b'>>;
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
