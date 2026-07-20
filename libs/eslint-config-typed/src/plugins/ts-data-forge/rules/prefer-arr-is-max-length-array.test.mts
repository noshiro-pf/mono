import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsMaxLengthArray } from './prefer-arr-is-max-length-array.mjs';

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

describe('prefer-arr-is-max-length-array', () => {
  tester.run('prefer-arr-is-max-length-array', preferArrIsMaxLengthArray, {
    valid: [
      {
        name: 'ignores non-array types',
        code: dedent`
          const str = "hello";
          const ok = str.length <= 5;
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
        name: 'ignores < comparisons',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length < 5;
        `,
      },
      {
        name: 'ignores >= comparisons (that is a min bound)',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length >= 3;
        `,
      },
      {
        name: 'ignores === comparisons',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length === 3;
        `,
      },
      {
        name: 'ignores comparison with non-const variable',
        code: dedent`
          const xs = [1, 2, 3];
          let n = 3;
          const ok = xs.length <= n;
        `,
      },
      {
        name: 'ignores comparison with const variable of type number',
        code: dedent`
          const xs = [1, 2, 3];
          const n: number = 3;
          const ok = xs.length <= n;
        `,
      },
      {
        name: 'defers bounded range to the bounded rule',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = xs.length >= 1 && xs.length <= 5;
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces xs.length <= n with Arr.isMaxLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = xs.length <= 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isMaxLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsMaxLengthArray' }],
      },
      {
        name: 'replaces n >= xs.length with Arr.isMaxLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = 3 >= xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isMaxLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsMaxLengthArray' }],
      },
      {
        name: 'works with no type annotation',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length <= 1;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isMaxLengthArray(xs, 1);
        `,
        errors: [{ messageId: 'useIsMaxLengthArray' }],
      },
      {
        name: 'works with const assertion',
        code: dedent`
          const xs = [1, 2, 3] as const;
          const ok = xs.length <= 2;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3] as const;
          const ok = Arr.isMaxLengthArray(xs, 2);
        `,
        errors: [{ messageId: 'useIsMaxLengthArray' }],
      },
      {
        name: 'works with variable length',
        code: dedent`
          const xs = [1, 2, 3];
          const n = 2;
          const ok = xs.length <= n;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const n = 2;
          const ok = Arr.isMaxLengthArray(xs, n);
        `,
        errors: [{ messageId: 'useIsMaxLengthArray' }],
      },
      {
        name: 'keeps existing Arr import',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = xs.length <= 1;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = Arr.isMaxLengthArray(xs, 1);
        `,
        errors: [{ messageId: 'useIsMaxLengthArray' }],
      },
      {
        name: 'replaces multiple checks',
        code: dedent`
          const xs = [1, 2, 3];
          const ys = [4, 5];
          const ok1 = xs.length <= 2;
          const ok2 = ys.length <= 1;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ys = [4, 5];
          const ok1 = Arr.isMaxLengthArray(xs, 2);
          const ok2 = Arr.isMaxLengthArray(ys, 1);
        `,
        errors: [
          { messageId: 'useIsMaxLengthArray' },
          { messageId: 'useIsMaxLengthArray' },
        ],
      },
    ],
  });
}, 20000);
