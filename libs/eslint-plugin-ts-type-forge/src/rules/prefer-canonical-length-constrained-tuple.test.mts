import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCanonicalLengthConstrainedTuple } from './prefer-canonical-length-constrained-tuple.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  },
});

describe('prefer-canonical-length-constrained-tuple', () => {
  tester.run(
    'prefer-canonical-length-constrained-tuple',
    preferCanonicalLengthConstrainedTuple,
    {
      valid: [
        {
          name: 'ignores heterogeneous tuples',
          code: 'type T = readonly [string, number];',
        },
        {
          name: 'ignores single-element tuples',
          code: 'type T = readonly [string];',
        },
        {
          name: 'ignores tuples longer than maxLength',
          options: [{ maxLength: 2 }],
          code: 'type T = readonly [string, string, string];',
        },
        {
          name: 'ignores labelled members (the labels would be lost)',
          code: 'type T = readonly [a: string, b: string];',
        },
        {
          name: 'ignores optional members',
          code: 'type T = readonly [string, string?];',
        },
        {
          name: 'ignores rest-only tuples',
          code: 'type T = readonly [...string[]];',
        },
        {
          name: 'ignores a tuple that defines a directly recursive alias',
          code: 'type T = readonly [T, T];',
        },
        {
          name: 'ignores a tuple whose alias recurses through another alias',
          code: dedent`
            type LambdaTerm = string | LambdaApplication;
            type LambdaApplication = readonly [LambdaTerm, LambdaTerm];
          `,
        },
        {
          name: 'ignores a tuple whose alias recurses through a chain of aliases',
          code: dedent`
            type A = readonly [B, B];
            type B = C;
            type C = A | string;
          `,
        },
        {
          name: 'still ignores nothing when the cycle does not reach the tuple',
          code: dedent`
            type Loop = readonly Loop[];
            type Unrelated = string;
          `,
        },
        {
          name: 'ignores plain arrays',
          code: 'type T = readonly string[];',
        },
        {
          name: 'ignores tuple patterns in a conditional type `extends` clause',
          code: dedent`
            type And<A extends boolean, B extends boolean> = [A, B] extends [
              true,
              true,
            ]
              ? true
              : false;
          `,
        },
        {
          name: 'ignores tuple patterns nested in an `extends` clause',
          code: 'type T<A> = A extends readonly (readonly [string, string])[] ? 1 : 2;',
        },
        {
          name: 'stays silent when the target name is bound locally',
          code: dedent`
            type FixedLengthTuple<N, V> = readonly [N, V];
            type T = readonly [string, string];
          `,
        },
      ],
      invalid: [
        {
          name: 'still rewrites the branches of a conditional type',
          code: 'type T<A> = A extends 1 ? [true, true] : 2;',
          output: dedent`
            import { type MutableFixedLengthTuple } from 'ts-type-forge';
            type T<A> = A extends 1 ? MutableFixedLengthTuple<2, true> : 2;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly non-empty tuple',
          code: 'type T = readonly [string, ...string[]];',
          output: dedent`
            import { type NonEmptyTuple } from 'ts-type-forge';
            type T = NonEmptyTuple<string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'mutable non-empty tuple',
          code: 'type T = [string, ...string[]];',
          output: dedent`
            import { type MutableNonEmptyTuple } from 'ts-type-forge';
            type T = MutableNonEmptyTuple<string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly non-empty tuple with a readonly rest spelling',
          code: 'type T = readonly [string, ...(readonly string[])];',
          output: dedent`
            import { type NonEmptyTuple } from 'ts-type-forge';
            type T = NonEmptyTuple<string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly fixed-length tuple',
          code: 'type T = readonly [string, string, string];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<3, string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'mutable fixed-length tuple',
          code: 'type T = [string, string, string];',
          output: dedent`
            import { type MutableFixedLengthTuple } from 'ts-type-forge';
            type T = MutableFixedLengthTuple<3, string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly min-length tuple',
          code: 'type T = readonly [number, number, ...number[]];',
          output: dedent`
            import { type MinLengthTuple } from 'ts-type-forge';
            type T = MinLengthTuple<2, number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'mutable min-length tuple',
          code: 'type T = [number, number, ...number[]];',
          output: dedent`
            import { type MutableMinLengthTuple } from 'ts-type-forge';
            type T = MutableMinLengthTuple<2, number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'readonly rest spelling inside a readonly tuple',
          code: 'type T = readonly [number, number, ...(readonly number[])];',
          output: dedent`
            import { type MinLengthTuple } from 'ts-type-forge';
            type T = MinLengthTuple<2, number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'handles the default maximum length of 10',
          code: 'type T = readonly [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<10, 1>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'keeps a composite element type intact',
          code: 'type T = readonly [string | number, string | number];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<2, string | number>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'handles generic element types',
          code: 'type T<V> = [V, V, ...V[]];',
          output: dedent`
            import { type MutableMinLengthTuple } from 'ts-type-forge';
            type T<V> = MutableMinLengthTuple<2, V>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'adds named imports once per target type',
          code: dedent`
            type A = readonly [string, string];
            type B = readonly [number, number, number];
            type C = [number, number, ...number[]];
          `,
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            import { type MutableMinLengthTuple } from 'ts-type-forge';
            type A = FixedLengthTuple<2, string>;
            type B = FixedLengthTuple<3, number>;
            type C = MutableMinLengthTuple<2, number>;
          `,
          errors: [
            { messageId: 'useCanonicalTuple' },
            { messageId: 'useCanonicalTuple' },
            { messageId: 'useCanonicalTuple' },
          ],
        },
        {
          name: 'adds no import under importStyle: global',
          options: [{ importStyle: 'global' }],
          code: 'type T = readonly [string, string];',
          output: 'type T = FixedLengthTuple<2, string>;',
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'reuses an aliased import',
          code: dedent`
            import { type FixedLengthTuple as FLT } from 'ts-type-forge';

            type T = readonly [string, string];
          `,
          output: dedent`
            import { type FixedLengthTuple as FLT } from 'ts-type-forge';

            type T = FLT<2, string>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
        {
          name: 'rewrites parameter and return type positions',
          code: 'declare const f: (xs: readonly [number, number]) => [string, string];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            import { type MutableFixedLengthTuple } from 'ts-type-forge';
            declare const f: (xs: FixedLengthTuple<2, number>) => MutableFixedLengthTuple<2, string>;
          `,
          errors: [
            { messageId: 'useCanonicalTuple' },
            { messageId: 'useCanonicalTuple' },
          ],
        },
        {
          name: 'respects a raised maxLength',
          options: [{ maxLength: 12 }],
          code: 'type T = readonly [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];',
          output: dedent`
            import { type FixedLengthTuple } from 'ts-type-forge';
            type T = FixedLengthTuple<12, 0>;
          `,
          errors: [{ messageId: 'useCanonicalTuple' }],
        },
      ],
    },
  );
});
