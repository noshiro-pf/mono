import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrSum } from './prefer-arr-sum.mjs';

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

describe('prefer-arr-sum', () => {
  tester.run('prefer-arr-sum', preferArrSum, {
    valid: [
      {
        name: 'ignores reduce with different operation',
        code: dedent`
          const xs = [1, 2, 3];
          const result = xs.reduce((a, b) => a * b, 1);
        `,
      },
      {
        name: 'ignores reduce with non-zero initial value',
        code: dedent`
          const xs = [1, 2, 3];
          const result = xs.reduce((a, b) => a + b, 10);
        `,
      },
      {
        name: 'the shape that reads a property of the running total, which does not compile',
        code: dedent`
          const xs: readonly { v: number }[] = [{ v: 1 }, { v: 2 }];
          // @ts-expect-error the running total is a number
          const sum = xs.reduce((a, b) => a.v + b.v, 0);
        `,
      },
      {
        name: 'a property that is not a number',
        code: dedent`
          const xs: readonly { v: string }[] = [];
          const sum = xs.reduce((acc, x) => acc + x.v, 0);
        `,
      },
      {
        name: 'a receiver that is not an array',
        code: dedent`
          declare const o: {
            reduce(
              f: (a: number, b: { v: number }) => number,
              init: number,
            ): number;
          };
          const sum = o.reduce((acc, x) => acc + x.v, 0);
        `,
      },
      {
        name: 'a property path that reads the accumulator, an index or the array',
        code: dedent`
          const xs: readonly { vs: readonly number[]; v: number }[] = [];
          const a = xs.reduce((acc, x) => acc + (x.vs[acc] ?? 0), 0);
          const b = xs.reduce((acc, x, i) => acc + x.v + i, 0);
        `,
      },
      {
        name: 'an accumulator plus a property from another initial value',
        code: dedent`
          const xs: readonly { v: number }[] = [];
          const sum = xs.reduce((acc, x) => acc + x.v, 10);
        `,
      },
      {
        name: 'ignores non-number array',
        code: dedent`
          const xs = [1, "2", "3"];
          const result = xs.reduce((a, b) => a + b, 0);
        `,
      },
      {
        name: 'ignores non-number value array',
        code: dedent`
          const xs = [{ v: 1 }, { v: "2" }];
          const sum = xs.reduce((a, b) => a.v + b.v, 0);
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces xs.reduce((a, b) => a + b, 0) with Arr.sum',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const sum = xs.reduce((a, b) => a + b, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const sum = Arr.sum(xs);
        `,
        errors: [{ messageId: 'useArrSum' }],
      },

      ...([
        {
          name: 'no type annotation array',
          code: dedent`
            const xs = [1, 2, 3];
            const sum = xs.reduce((a, b) => a + b, 0);
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3];
            const sum = Arr.sum(xs);
          `,
          errors: [{ messageId: 'useArrSum' }],
        },
        {
          name: 'no type annotation array with const assertion',
          code: dedent`
            const xs = [1, 2, 3] as const;
            const sum = xs.reduce((a, b) => a + b, 0);
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3] as const;
            const sum = Arr.sum(xs);
          `,
          errors: [{ messageId: 'useArrSum' }],
        },
        {
          name: 'no type annotation array with satisfies operator',
          code: dedent`
            const xs = [1, 2, 3] as const satisfies readonly number[];
            const sum = xs.reduce((a, b) => a + b, 0);
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3] as const satisfies readonly number[];
            const sum = Arr.sum(xs);
          `,
          errors: [{ messageId: 'useArrSum' }],
        },
      ] as const),

      {
        name: 'replaces an accumulator plus a property with Arr.sumBy',
        code: dedent`
          const xs: readonly { v: number }[] = [{ v: 1 }, { v: 2 }];
          const sum = xs.reduce((acc, x) => acc + x.v, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly { v: number }[] = [{ v: 1 }, { v: 2 }];
          const sum = Arr.sumBy(xs, x => x.v);
        `,
        errors: [{ messageId: 'useArrSumBy' }],
      },
      {
        name: 'the property before the accumulator, on a tuple',
        code: dedent`
          const xs = [{ v: 1 }, { v: 2 }] as const;
          const sum = xs.reduce((acc, x) => x.v + acc, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [{ v: 1 }, { v: 2 }] as const;
          const sum = Arr.sumBy(xs, x => x.v);
        `,
        errors: [{ messageId: 'useArrSumBy' }],
      },
      {
        name: 'a bracket key',
        code: dedent`
          const xs: readonly { v: number }[] = [];
          const sum = xs.reduce((acc, x) => acc + x['v'], 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly { v: number }[] = [];
          const sum = Arr.sumBy(xs, x => x['v']);
        `,
        errors: [{ messageId: 'useArrSumBy' }],
      },
      {
        name: 'a nested path',
        code: dedent`
          const xs: readonly { w: { n: number } }[] = [];
          const sum = xs.reduce((acc, x) => acc + x.w.n, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly { w: { n: number } }[] = [];
          const sum = Arr.sumBy(xs, x => x.w.n);
        `,
        errors: [{ messageId: 'useArrSumBy' }],
      },

      {
        name: 'keeps existing Arr import',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          const xs: readonly number[] = [1, 2, 3];
          const sum = xs.reduce((a, b) => a + b, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          const xs: readonly number[] = [1, 2, 3];
          const sum = Arr.sum(xs);
        `,
        errors: [{ messageId: 'useArrSum' }],
      },
    ],
  });
}, 20000);

describe('prefer-arr-sum through type wrappers', () => {
  tester.run('prefer-arr-sum', preferArrSum, {
    valid: [
      {
        name: 'strings cast to numbers are concatenated, not summed',
        code: dedent`
          declare const xs: readonly string[];
          const sum = (xs as unknown as readonly number[]).reduce(
            (a, b) => a + b,
            0,
          );
        `,
      },
      {
        name: 'a string property cast to number',
        code: dedent`
          declare const xs: readonly Readonly<{ n: string }>[];
          const sum = xs.reduce(
            (acc, x) => acc + (x.n as unknown as number),
            0,
          );
        `,
      },
      {
        name: 'a computed `reduce` is some other method',
        code: dedent`
          declare const xs: readonly number[];
          declare const reduce: 'reduce';
          const sum = xs[reduce]((a, b) => a + b, 0);
        `,
      },
    ],
    invalid: [
      {
        name: 'the initial value or an operand wrapped',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = xs.reduce((a, b) => a + b, 0 as number);
          const b = xs.reduce((a, b) => a + (b satisfies number), 0);
          const c = xs!.reduce((a, b) => a! + b, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = Arr.sum(xs);
          const b = Arr.sum(xs);
          const c = Arr.sum(xs!);
        `,
        errors: [
          { messageId: 'useArrSum' },
          { messageId: 'useArrSum' },
          { messageId: 'useArrSum' },
        ],
      },
      {
        name: 'a property and the accumulator read through wrappers, which the mapper keeps',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly Readonly<{ n: number }>[];
          const a = xs.reduce((acc, x) => acc + (x.n satisfies number), 0);
          const b = xs.reduce((acc, x) => (acc as number) + x!.n, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly Readonly<{ n: number }>[];
          const a = Arr.sumBy(xs, x => x.n satisfies number);
          const b = Arr.sumBy(xs, x => x!.n);
        `,
        errors: [{ messageId: 'useArrSumBy' }, { messageId: 'useArrSumBy' }],
      },
    ],
  });
}, 20000);

describe('prefer-arr-sum with parenthesized operands', () => {
  tester.run('prefer-arr-sum', preferArrSum, {
    valid: [],
    invalid: [
      {
        name: 'a sequence array keeps its parentheses',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const sum = (log(), xs).reduce((a, b) => a + b, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const sum = Arr.sum((log(), xs));
        `,
        errors: [{ messageId: 'useArrSum' }],
      },
    ],
  });
}, 20000);
