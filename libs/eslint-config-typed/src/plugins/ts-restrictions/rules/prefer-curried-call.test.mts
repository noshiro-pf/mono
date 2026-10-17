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

/** A function with both a data-first and a curried signature. */
const bothDecl = dedent`
  type Both = {
    (a: number, b: number): number;
    (b: number): (a: number) => number;
  };
`;

describe('prefer-curried-call through type wrappers', () => {
  tester.run('prefer-curried-call', preferCurriedCall, {
    valid: [
      {
        name: 'a cast does not give the callee a curried signature',
        code: dedent`
          ${bothDecl}
          declare const f: (a: number, b: number) => number;
          [1, 2].map((a) => (f as unknown as Both)(a, 1));
        `,
      },
      {
        name: 'a cast does not make the callee unary',
        code: dedent`
          declare const f: (a: string, radix?: number) => number;
          ['1', '2'].map((a) => (f as (a: string) => number)(a));
        `,
      },
      {
        name: 'a cast does not make an impure argument pure',
        code: dedent`
          ${bothDecl}
          declare const g: Both;
          declare const h: () => number;
          [1, 2].map((a) => g(a, h() as number));
        `,
      },
      {
        name: 'a cast widening a unary callee is the author saying it may read more arguments',
        code: dedent`
          declare const u: (a: string) => number;
          ['1', '2'].map((a) => (u as (a: string, radix?: number) => number)(a));
        `,
      },
      {
        name: 'a cast widening a curried callee to one without a curried signature',
        code: dedent`
          ${bothDecl}
          declare const g: Both;
          [1, 2].map((a) => (g as (a: number, b: number) => number)(a, 1));
        `,
      },
    ],
    invalid: [
      {
        name: 'a remaining argument wrapped in `as` or `!`',
        code: dedent`
          ${bothDecl}
          declare const g: Both;
          declare const x: number;
          declare const y: number | undefined;
          [1, 2].map((a) => g(a, x as number));
          [1, 2].map((a) => g(a, y!));
        `,
        output: dedent`
          ${bothDecl}
          declare const g: Both;
          declare const x: number;
          declare const y: number | undefined;
          [1, 2].map(g(x as number));
          [1, 2].map(g(y!));
        `,
        errors: [
          { messageId: 'useCurriedForm' },
          { messageId: 'useCurriedForm' },
        ],
      },
      {
        name: 'a callee wrapped in `satisfies` keeps the wrapper',
        code: dedent`
          ${bothDecl}
          declare const g: Both;
          declare const u: (a: number) => number;
          [1, 2].map((a) => (g satisfies Both)(a, 1));
          [1, 2].map((a) => (u satisfies (a: number) => number)(a));
        `,
        output: dedent`
          ${bothDecl}
          declare const g: Both;
          declare const u: (a: number) => number;
          [1, 2].map((g satisfies Both)(1));
          [1, 2].map(u satisfies (a: number) => number);
        `,
        errors: [
          { messageId: 'useCurriedForm' },
          { messageId: 'useFunctionDirectly' },
        ],
      },
      {
        name: 'a callee that is curried or unary at every layer',
        code: dedent`
          ${bothDecl}
          declare const g: Both;
          declare const u: (a: number) => number;
          [1, 2].map((a) => (g as Both)(a, 1));
          [1, 2].map((a) => (u as (a: number) => number)(a));
        `,
        output: dedent`
          ${bothDecl}
          declare const g: Both;
          declare const u: (a: number) => number;
          [1, 2].map((g as Both)(1));
          [1, 2].map(u as (a: number) => number);
        `,
        errors: [
          { messageId: 'useCurriedForm' },
          { messageId: 'useFunctionDirectly' },
        ],
      },
    ],
  });
});

describe('prefer-curried-call with parenthesized operands', () => {
  tester.run('prefer-curried-call', preferCurriedCall, {
    valid: [],
    invalid: [
      {
        name: 'a conditional callee keeps its parentheses',
        code: dedent`
          ${bothDecl}
          declare const c: boolean;
          declare const g: Both;
          declare const h: Both;
          [1, 2].map((a) => (c ? g : h)(a, 1));
        `,
        output: dedent`
          ${bothDecl}
          declare const c: boolean;
          declare const g: Both;
          declare const h: Both;
          [1, 2].map((c ? g : h)(1));
        `,
        errors: [{ messageId: 'useCurriedForm' }],
      },
    ],
  });
});

describe('prefer-curried-call with a global callee', () => {
  tester.run('prefer-curried-call', preferCurriedCall, {
    valid: [
      {
        name: 'a host function from the default libraries keeps its wrapper (it needs `globalThis` as its receiver)',
        code: dedent`
          /// <reference lib="dom" />
          declare const callbacks: readonly FrameRequestCallback[];
          const ids = callbacks.map((callback) => requestAnimationFrame(callback));
          const scheduler = {
            requestFrame: (callback: FrameRequestCallback) =>
              requestAnimationFrame(callback),
          };
          const handles = [1, 2].map((handle) => clearTimeout(handle));
        `,
      },
      {
        name: 'a host function stays wrapped through a type wrapper',
        code: dedent`
          /// <reference lib="dom" />
          declare const callbacks: readonly FrameRequestCallback[];
          const ids = callbacks.map((callback) =>
            (requestAnimationFrame as (c: FrameRequestCallback) => number)(
              callback,
            ),
          );
        `,
      },
    ],
    invalid: [
      {
        name: 'an ECMAScript global function is fixed',
        code: dedent`
          declare const xs: readonly string[];
          const ys = xs.map((a) => parseFloat(a));
          const zs = xs.filter((a) => Boolean(a));
          const ws = xs.map((a) => encodeURIComponent(a));
        `,
        output: dedent`
          declare const xs: readonly string[];
          const ys = xs.map(parseFloat);
          const zs = xs.filter(Boolean);
          const ws = xs.map(encodeURIComponent);
        `,
        errors: [
          { messageId: 'useFunctionDirectly' },
          { messageId: 'useFunctionDirectly' },
          { messageId: 'useFunctionDirectly' },
        ],
      },
      {
        name: 'a global declared in `declare global` is only suggested',
        code: dedent`
          export {};
          declare global {
            function hostUnary(a: number): boolean;
          }
          const ys = [1, 2].map((a) => hostUnary(a));
        `,
        errors: [
          {
            messageId: 'mayNeedGlobalReceiver',
            suggestions: [
              {
                messageId: 'replaceWithFunction',
                output: dedent`
                  export {};
                  declare global {
                    function hostUnary(a: number): boolean;
                  }
                  const ys = [1, 2].map(hostUnary);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});
