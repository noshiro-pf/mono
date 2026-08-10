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

      ...([
        {
          name: 'replaces xs.reduce with property access with Arr.sumBy',
          code: dedent`
            const xs: readonly { v: number }[] = [{ v: 1 }, { v: 2 }];
            const sum = xs.reduce((a, b) => a.v + b.v, 0);
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs: readonly { v: number }[] = [{ v: 1 }, { v: 2 }];
            const sum = Arr.sumBy(xs, a => a.v);
          `,
          errors: [{ messageId: 'useArrSumBy' }],
        },
        ...([
          {
            name: 'replaces xs.reduce with property access with Arr.sumBy',
            code: dedent`
              const xs = [{ v: 1 }, { v: 2 }] as const;
              const sum = xs.reduce((a, b) => a.v + b.v, 0);
            `,
            output: dedent`
              import { Arr } from 'ts-data-forge';
              const xs = [{ v: 1 }, { v: 2 }] as const;
              const sum = Arr.sumBy(xs, a => a.v);
            `,
            errors: [{ messageId: 'useArrSumBy' }],
          },
        ] as const),
        {
          name: 'replaces xs.reduce with bracket property access with Arr.sumBy',
          code: dedent`
            const xs: readonly { v: number }[] = [{ v: 1 }, { v: 2 }];
            const sum = xs.reduce((a, b) => a['v'] + b['v'], 0);
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs: readonly { v: number }[] = [{ v: 1 }, { v: 2 }];
            const sum = Arr.sumBy(xs, a => a['v']);
          `,
          errors: [{ messageId: 'useArrSumBy' }],
        },
      ] as const),

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
