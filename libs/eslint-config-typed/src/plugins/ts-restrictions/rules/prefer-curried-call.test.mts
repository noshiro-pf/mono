import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCurriedCall } from './prefer-curried-call.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

/** A curried, data-first function declaration shared by many test cases. */
const curriedDecls = dedent`
  declare function toPushed<Ar extends readonly unknown[], V>(
    array: Ar,
    v: V,
  ): readonly [...Ar, V];
  declare function toPushed<V>(
    v: V,
  ): <Ar extends readonly unknown[]>(array: Ar) => readonly [...Ar, V];

  declare function take<Ar extends readonly unknown[]>(
    array: Ar,
    n: number,
  ): Ar;
  declare function take(
    n: number,
  ): <Ar extends readonly unknown[]>(array: Ar) => Ar;

  declare namespace Arr {
    function toPushed<Ar extends readonly unknown[], V>(
      array: Ar,
      v: V,
    ): readonly [...Ar, V];
    function toPushed<V>(
      v: V,
    ): <Ar extends readonly unknown[]>(array: Ar) => readonly [...Ar, V];

    function isNonEmpty<E>(array: readonly E[]): boolean;
  }

  declare function isNonEmpty<E>(array: readonly E[]): boolean;
`;

describe('prefer-curried-call', () => {
  tester.run('prefer-curried-call', preferCurriedCall, {
    valid: [
      {
        name: 'non-curried multi-argument function is left untouched',
        code: dedent`
          declare function add(a: number, b: number): number;
          declare const xs: readonly number[];
          const ys = xs.map((a) => add(a, 1));
        `,
      },
      {
        name: 'eta reduction is skipped when the function is not unary (parseInt/radix footgun)',
        code: dedent`
          declare const xs: readonly string[];
          const ys = xs.map((a) => parseInt(a));
        `,
      },
      {
        name: 'eta reduction is skipped for instance methods (would drop `this`)',
        code: dedent`
          declare const obj: { method(a: number): boolean };
          declare const xs: readonly number[];
          const ys = xs.map((a) => obj.method(a));
        `,
      },
      {
        name: 'parameter used more than once is left untouched',
        code: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => toPushed(a, a));
        `,
      },
      {
        name: 'parameter that is not the first argument is left untouched',
        code: dedent`
          ${curriedDecls}
          declare const x: readonly number[];
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => toPushed(x, a));
        `,
      },
      {
        name: 'impure remaining argument is left untouched (evaluation timing)',
        code: dedent`
          ${curriedDecls}
          declare function sideEffect(): number;
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => toPushed(a, sideEffect()));
        `,
      },
      {
        name: 'annotated parameter is left untouched',
        code: dedent`
          ${curriedDecls}
          const f = (a: readonly number[]) => toPushed(a, 5);
        `,
      },
      {
        name: 'async wrapper is left untouched',
        code: dedent`
          declare function load<E>(array: readonly E[]): Promise<readonly E[]>;
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map(async (a) => load(a));
        `,
      },
      {
        name: 'already-curried callee (a call expression) is left untouched for eta',
        code: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => take(3)(a));
        `,
      },
      {
        name: 'multi-argument arrow is left untouched',
        code: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a, i) => toPushed(a, i));
        `,
      },
    ],

    invalid: [
      {
        name: 'eta reduction of a standalone unary function',
        code: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => isNonEmpty(a));
        `,
        output: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map(isNonEmpty);
        `,
        errors: [{ messageId: 'useFunctionDirectly' }],
      },
      {
        name: 'eta reduction of a namespace-member unary function',
        code: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => Arr.isNonEmpty(a));
        `,
        output: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map(Arr.isNonEmpty);
        `,
        errors: [{ messageId: 'useFunctionDirectly' }],
      },
      {
        name: 'curried form of a standalone two-argument function',
        code: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => toPushed(a, 5));
        `,
        output: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map(toPushed(5));
        `,
        errors: [{ messageId: 'useCurriedForm' }],
      },
      {
        name: 'curried form of a namespace-member function (the motivating example)',
        code: dedent`
          ${curriedDecls}
          declare const newElem: number;
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => Arr.toPushed(a, newElem));
        `,
        output: dedent`
          ${curriedDecls}
          declare const newElem: number;
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map(Arr.toPushed(newElem));
        `,
        errors: [{ messageId: 'useCurriedForm' }],
      },
      {
        name: 'curried form with a counted argument (take)',
        code: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map((a) => take(a, 3));
        `,
        output: dedent`
          ${curriedDecls}
          declare const xss: readonly (readonly number[])[];
          const ys = xss.map(take(3));
        `,
        errors: [{ messageId: 'useCurriedForm' }],
      },
    ],
  });
});
