import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrUniq } from './prefer-arr-uniq.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

describe('prefer-arr-uniq', () => {
  tester.run('prefer-arr-uniq', preferArrUniq, {
    valid: [
      {
        name: 'ignores Arr.uniq',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 2];
          const ys = Arr.uniq(xs);
        `,
      },
      {
        name: 'ignores an array of objects (Arr.uniq does not accept it)',
        code: dedent`
          const xs: readonly { v: number }[] = [{ v: 1 }];
          const ys = Array.from(new Set(xs));
          const zs = [...new Set(xs)];
        `,
      },
      {
        name: 'ignores an array of unions including objects',
        code: dedent`
          const xs: readonly (number | { v: number })[] = [1];
          const ys = [...new Set(xs)];
        `,
      },
      {
        name: 'ignores an intersection of object arrays',
        code: dedent`
          declare const xs: readonly { v: number }[] & Readonly<{ brand: 'b' }>;
          const ys = [...new Set(xs)];
        `,
      },
      {
        name: 'ignores an array of unknown',
        code: dedent`
          const xs: readonly unknown[] = [1];
          const ys = [...new Set(xs)];
        `,
      },
      {
        name: 'ignores a string argument (not an array)',
        code: dedent`
          const s = 'abc';
          const ys = Array.from(new Set(s));
        `,
      },
      {
        name: 'ignores an iterable that is not an array',
        code: dedent`
          const m = new Map<string, number>();
          const ys = [...new Set(m.keys())];
        `,
      },
      {
        name: 'ignores a Set bound to a variable',
        code: dedent`
          const xs: readonly number[] = [1, 2];
          const set = new Set(xs);
          const has = set.has(1);
          const ys = Array.from(set);
        `,
      },
      {
        name: 'ignores Array.from with a mapping function',
        code: dedent`
          const xs: readonly number[] = [1, 2];
          const ys = Array.from(new Set(xs), (x) => x * 2);
        `,
      },
      {
        name: 'ignores new Set with explicit type arguments',
        code: dedent`
          const xs: readonly number[] = [1, 2];
          const ys = [...new Set<number | string>(xs)];
        `,
      },
      {
        name: 'ignores an empty Set and a spread argument',
        code: dedent`
          const xs: readonly (readonly number[])[] = [[1]];
          const a = [...new Set()];
          const b = Array.from(new Set(...xs));
        `,
      },
      {
        name: 'ignores a spread with other elements',
        code: dedent`
          const xs: readonly number[] = [1, 2];
          const ys = [0, ...new Set(xs)];
        `,
      },
      {
        name: 'ignores a shadowed Set',
        code: dedent`
          class Set<T> { constructor(_: readonly T[]) {} *[Symbol.iterator]() {} }
          const xs: readonly number[] = [1, 2];
          const ys = [...new Set(xs)];
        `,
      },
      {
        name: 'ignores a shadowed Array',
        code: dedent`
          const Array = { from: <T,>(x: Iterable<T>): T[] => [...x] };
          const xs: readonly number[] = [1, 2];
          const ys = Array.from(new Set(xs));
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces Array.from(new Set(xs))',
        code: dedent`
          const xs: readonly number[] = [1, 2, 2];
          const ys = Array.from(new Set(xs));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 2];
          const ys = Arr.uniq(xs);
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'replaces [...new Set(xs)]',
        code: dedent`
          const xs: readonly string[] = ['a', 'b', 'a'];
          const ys = [...new Set(xs)];
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly string[] = ['a', 'b', 'a'];
          const ys = Arr.uniq(xs);
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'does not add an import when Arr is already imported',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 2];
          const ys = [...new Set(xs)];
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 2];
          const ys = Arr.uniq(xs);
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'uses the local name of an aliased Arr import',
        code: dedent`
          import { Arr as A } from 'ts-data-forge';
          const xs = [1, 2, 2];
          const ys = [...new Set(xs)];
        `,
        output: dedent`
          import { Arr as A } from 'ts-data-forge';
          const xs = [1, 2, 2];
          const ys = A.uniq(xs);
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'adds the import once for several matches',
        code: dedent`
          const xs = ['a', 'b'];
          const ys = [...new Set(xs)];
          const zs = Array.from(new Set(xs));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = ['a', 'b'];
          const ys = Arr.uniq(xs);
          const zs = Arr.uniq(xs);
        `,
        errors: [{ messageId: 'useArrUniq' }, { messageId: 'useArrUniq' }],
      },
      {
        name: 'accepts tuples, literal unions, nullish and inline arrays',
        code: dedent`
          const t = [1, 'a', 1] as const;
          const u: readonly ('x' | 'y' | null | undefined | boolean | bigint)[] = [];
          const a = [...new Set(t)];
          const b = [...new Set(u)];
          const c = Array.from(new Set([1, 2, 1]));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const t = [1, 'a', 1] as const;
          const u: readonly ('x' | 'y' | null | undefined | boolean | bigint)[] = [];
          const a = Arr.uniq(t);
          const b = Arr.uniq(u);
          const c = Arr.uniq([1, 2, 1]);
        `,
        errors: [
          { messageId: 'useArrUniq' },
          { messageId: 'useArrUniq' },
          { messageId: 'useArrUniq' },
        ],
      },
      {
        name: 'accepts a type parameter constrained to a primitive array',
        code: dedent`
          export const f = <T extends readonly string[]>(xs: T): readonly string[] =>
            [...new Set(xs)];
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          export const f = <T extends readonly string[]>(xs: T): readonly string[] =>
            Arr.uniq(xs);
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'accepts an intersection with a primitive array',
        code: dedent`
          type Branded = readonly string[] & Readonly<{ brand: 'b' }>;
          declare const xs: Branded;
          const ys: readonly string[] = [...new Set(xs)];
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          type Branded = readonly string[] & Readonly<{ brand: 'b' }>;
          declare const xs: Branded;
          const ys: readonly string[] = Arr.uniq(xs);
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'accepts a readonly array parameter',
        code: dedent`
          const g = (xs: readonly number[]): number => xs.length;
          const xs = [1, 1];
          const n = g([...new Set(xs)]);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const g = (xs: readonly number[]): number => xs.length;
          const xs = [1, 1];
          const n = g(Arr.uniq(xs));
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'fixes an argument to a generic function taking a readonly array',
        code: dedent`
          const sorted = <const Ar extends readonly unknown[]>(xs: Ar): Ar => xs;
          const xs = ['b', 'a', 'b'];
          const ys = sorted(Array.from(new Set(xs)));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const sorted = <const Ar extends readonly unknown[]>(xs: Ar): Ar => xs;
          const xs = ['b', 'a', 'b'];
          const ys = sorted(Arr.uniq(xs));
        `,
        errors: [{ messageId: 'useArrUniq' }],
      },
      {
        name: 'only suggests when the result is sorted in place',
        code: dedent`
          const xs = [3, 1, 3];
          const ys = [...new Set(xs)].sort();
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrUniq',
            suggestions: [
              {
                messageId: 'suggestArrUniq',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  const xs = [3, 1, 3];
                  const ys = Arr.uniq(xs).sort();
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests when a variable holding the result is mutated',
        code: dedent`
          const xs = [3, 1, 3];
          const ys = Array.from(new Set(xs));
          ys.push(4);
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrUniq',
            suggestions: [
              {
                messageId: 'suggestArrUniq',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  const xs = [3, 1, 3];
                  const ys = Arr.uniq(xs);
                  ys.push(4);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests when an element of the result is assigned',
        code: dedent`
          const xs = [3, 1, 3];
          const ys = [...new Set(xs)];
          ys[0] = 2;
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrUniq',
            suggestions: [
              {
                messageId: 'suggestArrUniq',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  const xs = [3, 1, 3];
                  const ys = Arr.uniq(xs);
                  ys[0] = 2;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests when a mutable array is expected',
        code: dedent`
          const h = (xs: number[]): number => xs.length;
          const xs = [1, 1];
          const n = h([...new Set(xs)]);
          const m: number[] | undefined = Array.from(new Set(xs));
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrUniq',
            suggestions: [
              {
                messageId: 'suggestArrUniq',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  const h = (xs: number[]): number => xs.length;
                  const xs = [1, 1];
                  const n = h(Arr.uniq(xs));
                  const m: number[] | undefined = Array.from(new Set(xs));
                `,
              },
            ],
          },
          {
            messageId: 'useArrUniq',
            suggestions: [
              {
                messageId: 'suggestArrUniq',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  const h = (xs: number[]): number => xs.length;
                  const xs = [1, 1];
                  const n = h([...new Set(xs)]);
                  const m: number[] | undefined = Arr.uniq(xs);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'only suggests when a variable holding the result is passed as a mutable array',
        code: dedent`
          const h = (xs: string[]): number => xs.length;
          const xs = ['a'];
          const ys = [...new Set(xs)];
          const n = h(ys);
        `,
        output: null,
        errors: [
          {
            messageId: 'useArrUniq',
            suggestions: [
              {
                messageId: 'suggestArrUniq',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  const h = (xs: string[]): number => xs.length;
                  const xs = ['a'];
                  const ys = Arr.uniq(xs);
                  const n = h(ys);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'fixes the autofixable matches and suggests the rest',
        code: dedent`
          const xs = [3, 1, 3];
          const a = [...new Set(xs)].sort();
          const b = [...new Set(xs)];
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [3, 1, 3];
          const a = [...new Set(xs)].sort();
          const b = Arr.uniq(xs);
        `,
        errors: [
          {
            messageId: 'useArrUniq',
            suggestions: [
              {
                messageId: 'suggestArrUniq',
                output: dedent`
                  import { Arr } from 'ts-data-forge';
                  const xs = [3, 1, 3];
                  const a = Arr.uniq(xs).sort();
                  const b = [...new Set(xs)];
                `,
              },
            ],
          },
          { messageId: 'useArrUniq' },
        ],
      },
    ],
  });
});
