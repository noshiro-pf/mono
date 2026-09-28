import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferOptionalChainOverTernary } from './prefer-optional-chain-over-ternary.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('prefer-optional-chain-over-ternary', () => {
  tester.run(
    'prefer-optional-chain-over-ternary',
    preferOptionalChainOverTernary,
    {
      valid: [
        {
          name: '`=== undefined` does not cover a `null` the type allows',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x === undefined ? undefined : x?.b;
          `,
        },
        {
          name: '`=== null` does not cover an `undefined` the type allows',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x === null ? undefined : x?.b;
          `,
        },
        {
          name: 'a strict check on `any` proves nothing',
          code: dedent`
            declare const x: any;
            const y = x === undefined ? undefined : x.b;
          `,
        },
        {
          name: 'a type parameter whose constraint allows `null`',
          code: dedent`
            const f = <T extends Readonly<{ b: number }> | null | undefined>(
              x: T,
            ) => (x === undefined ? undefined : x?.b);
          `,
        },
        {
          name: 'the nullish branch is `null`, which `?.` would turn into `undefined`',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            const y = x == null ? null : x.b;
          `,
        },
        {
          name: 'the other branch does not start from the checked value',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            declare const z: Readonly<{ b: number }>;
            declare const f: (t: Readonly<{ b: number }>) => number;
            const y = x == null ? undefined : z.b;
            const w = x == null ? undefined : f(x);
          `,
        },
        {
          name: 'the other branch is the checked value itself',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            const y = x == null ? undefined : x;
          `,
        },
        {
          name: 'a check that is not a nullish check',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            declare const z: Readonly<{ b: number }>;
            declare const c: boolean;
            const y = c ? undefined : x?.b;
            const w = x === z ? undefined : x?.b;
          `,
        },
        {
          name: 'called: `(x?.f)()` would call `f` on `x`, where the ternary passes no `this`',
          code: dedent`
            declare const x: Readonly<{ f: () => number }> | undefined;
            const y = (x == null ? undefined : x.f)?.();
          `,
        },
        {
          name: 'a tag: the same `this` difference',
          code: dedent`
            declare const x:
              | Readonly<{ t: (s: TemplateStringsArray) => string }>
              | undefined;
            const y = (x == null ? undefined : x.t)!\`a\`;
          `,
        },
        {
          name: 'the two halves of `||` check different values',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            declare const w: Readonly<{ b: number }> | null | undefined;
            const y = x === null || w === undefined ? undefined : x?.b;
          `,
        },
      ],
      invalid: [
        {
          name: '`x == null ? undefined : x.b`',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x == null ? undefined : x.b;
          `,
          output: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain', data: { replacement: 'x?.b' } },
          ],
        },
        {
          name: 'the negated form, and the operands either way round',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x != null ? x.b : undefined;
            const z = null == x ? undefined : x.b;
            const w = undefined != x ? x.b : undefined;
            const v = x == undefined ? undefined : x.b;
          `,
          output: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x?.b;
            const z = x?.b;
            const w = x?.b;
            const v = x?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'a strict check is enough when the type rules out the other nullish value',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            declare const n: Readonly<{ b: number }> | null;
            const y = x === undefined ? undefined : x.b;
            const z = x !== undefined ? x.b : undefined;
            const w = n === null ? undefined : n.b;
            const v = n !== null ? n.b : undefined;
          `,
          output: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            declare const n: Readonly<{ b: number }> | null;
            const y = x?.b;
            const z = x?.b;
            const w = n?.b;
            const v = n?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'both strict checks together',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x === null || x === undefined ? undefined : x.b;
            const z = x !== undefined && x !== null ? x.b : undefined;
          `,
          output: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x?.b;
            const z = x?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'a constrained type parameter is judged by its constraint',
          code: dedent`
            const f = <T extends Readonly<{ b: number }> | undefined>(x: T) =>
              x === undefined ? undefined : x.b;
          `,
          output: dedent`
            const f = <T extends Readonly<{ b: number }> | undefined>(x: T) =>
              x?.b;
          `,
          errors: [{ messageId: 'preferOptionalChain' }],
        },
        {
          name: 'element access, calls and longer chains',
          code: dedent`
            declare const a: readonly number[] | undefined;
            declare const f: ((n: number) => number) | undefined;
            declare const o:
              | Readonly<{ m: (n: number) => number; b: Readonly<{ c: number }> }>
              | undefined;
            const p = a == null ? undefined : a[0];
            const q = f == null ? undefined : f(1);
            const r = o == null ? undefined : o.m(1);
            const s = o == null ? undefined : o.b.c;
          `,
          output: dedent`
            declare const a: readonly number[] | undefined;
            declare const f: ((n: number) => number) | undefined;
            declare const o:
              | Readonly<{ m: (n: number) => number; b: Readonly<{ c: number }> }>
              | undefined;
            const p = a?.[0];
            const q = f?.(1);
            const r = o?.m(1);
            const s = o?.b.c;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'the checked value is itself a property',
          code: dedent`
            declare const o: Readonly<{ x: Readonly<{ b: number }> | undefined }>;
            const y = o.x == null ? undefined : o.x.b;
            const z = o['x'] == null ? undefined : o.x.b;
          `,
          output: dedent`
            declare const o: Readonly<{ x: Readonly<{ b: number }> | undefined }>;
            const y = o.x?.b;
            const z = o.x?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'the parentheses around the ternary stay, and keep it one step of a longer chain',
          code: dedent`
            declare const x:
              | Readonly<{ b: Readonly<{ c: number }> | undefined }>
              | undefined;
            const y = (x == null ? undefined : x.b)?.c;
          `,
          output: dedent`
            declare const x:
              | Readonly<{ b: Readonly<{ c: number }> | undefined }>
              | undefined;
            const y = (x?.b)?.c;
          `,
          errors: [{ messageId: 'preferOptionalChain' }],
        },
        {
          name: 'a comment inside is reported but not fixed away',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            const y = x == null ? undefined /* none */ : x.b;
          `,
          output: null,
          errors: [{ messageId: 'preferOptionalChain' }],
        },
      ],
    },
  );
});

describe('prefer-optional-chain-over-ternary through type wrappers', () => {
  tester.run(
    'prefer-optional-chain-over-ternary',
    preferOptionalChainOverTernary,
    {
      valid: [
        {
          name: 'a cast cannot rule out the `null` a strict check leaves',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y =
              (x as Readonly<{ b: number }> | undefined) === undefined
                ? undefined
                : x?.b;
          `,
        },
      ],
      invalid: [
        {
          name: '`undefined` wrapped in `satisfies` or `as` is still `undefined`',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            const y = x == null ? (undefined satisfies undefined) : x.b;
            const z = x === (undefined as undefined) ? undefined : x.b;
          `,
          output: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            const y = x?.b;
            const z = x?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'the checked value, or the access, wrapped in `satisfies`',
          code: dedent`
            type B = Readonly<{ b: number }>;
            declare const x: B | undefined;
            const y = (x satisfies B | undefined) == null ? undefined : x.b;
            const z = x == null ? undefined : (x.b satisfies number);
            const w = x == null ? undefined : (x satisfies B).b;
          `,
          output: dedent`
            type B = Readonly<{ b: number }>;
            declare const x: B | undefined;
            const y = x?.b;
            const z = x?.b satisfies number;
            const w = (x satisfies B)?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'the whole check, or one half of a pair, wrapped in `satisfies boolean`',
          code: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = ((x == null) satisfies boolean) ? undefined : x?.b;
            const z =
              ((x === null) satisfies boolean) || x === undefined
                ? undefined
                : x?.b;
          `,
          output: dedent`
            declare const x: Readonly<{ b: number }> | null | undefined;
            const y = x?.b;
            const z =
              x?.b;
          `,
          errors: [
            { messageId: 'preferOptionalChain' },
            { messageId: 'preferOptionalChain' },
          ],
        },
        {
          name: 'a non-null assertion on the checked value',
          code: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            const y = x == null ? undefined : x!.b;
          `,
          output: dedent`
            declare const x: Readonly<{ b: number }> | undefined;
            const y = x!?.b;
          `,
          errors: [{ messageId: 'preferOptionalChain' }],
        },
      ],
    },
  );
});
