import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsArrayAtLeastLength } from './prefer-arr-is-array-at-least-length.mjs';

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

describe('prefer-arr-is-array-at-least-length', () => {
  tester.run(
    'prefer-arr-is-array-at-least-length',
    preferArrIsArrayAtLeastLength,
    {
      valid: [
        {
          name: 'ignores non-array types',
          code: dedent`
            const str = "hello";
            const ok = str.length >= 5;
          `,
        },
        {
          name: 'ignores < comparisons',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length < 5;
          `,
        },
        {
          name: 'ignores > comparisons',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length > 0;
          `,
        },
        {
          name: 'ignores === comparisons',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length === 3;
          `,
        },
      ],
      invalid: [
        {
          name: 'replaces xs.length >= n with Arr.isArrayAtLeastLength',
          code: dedent`
            const xs: readonly number[] = [1, 2, 3];
            const ok = xs.length >= 3;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs: readonly number[] = [1, 2, 3];
            const ok = Arr.isArrayAtLeastLength(xs, 3);
          `,
          errors: [{ messageId: 'useIsArrayAtLeastLength' }],
        },
        {
          name: 'replaces n <= xs.length with Arr.isArrayAtLeastLength',
          code: dedent`
            const xs: readonly number[] = [1, 2, 3];
            const ok = 3 <= xs.length;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs: readonly number[] = [1, 2, 3];
            const ok = Arr.isArrayAtLeastLength(xs, 3);
          `,
          errors: [{ messageId: 'useIsArrayAtLeastLength' }],
        },
        {
          name: 'works with no type annotation',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length >= 1;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3];
            const ok = Arr.isArrayAtLeastLength(xs, 1);
          `,
          errors: [{ messageId: 'useIsArrayAtLeastLength' }],
        },
        {
          name: 'works with const assertion',
          code: dedent`
            const xs = [1, 2, 3] as const;
            const ok = xs.length >= 2;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3] as const;
            const ok = Arr.isArrayAtLeastLength(xs, 2);
          `,
          errors: [{ messageId: 'useIsArrayAtLeastLength' }],
        },
        {
          name: 'works with variable length',
          code: dedent`
            const xs = [1, 2, 3];
            const n = 2;
            const ok = xs.length >= n;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3];
            const n = 2;
            const ok = Arr.isArrayAtLeastLength(xs, n);
          `,
          errors: [{ messageId: 'useIsArrayAtLeastLength' }],
        },
        {
          name: 'keeps existing Arr import',
          code: dedent`
            import { Arr } from 'ts-data-forge';

            const xs = [1, 2, 3];
            const ok = xs.length >= 1;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';

            const xs = [1, 2, 3];
            const ok = Arr.isArrayAtLeastLength(xs, 1);
          `,
          errors: [{ messageId: 'useIsArrayAtLeastLength' }],
        },
        {
          name: 'replaces multiple checks',
          code: dedent`
            const xs = [1, 2, 3];
            const ys = [4, 5];
            const ok1 = xs.length >= 2;
            const ok2 = ys.length >= 1;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3];
            const ys = [4, 5];
            const ok1 = Arr.isArrayAtLeastLength(xs, 2);
            const ok2 = Arr.isArrayAtLeastLength(ys, 1);
          `,
          errors: [
            { messageId: 'useIsArrayAtLeastLength' },
            { messageId: 'useIsArrayAtLeastLength' },
          ],
        },
        {
          name: 'works with >= 0 (checking non-empty)',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length >= 1;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3];
            const ok = Arr.isArrayAtLeastLength(xs, 1);
          `,
          errors: [{ messageId: 'useIsArrayAtLeastLength' }],
        },
      ],
    },
  );
}, 20000);
