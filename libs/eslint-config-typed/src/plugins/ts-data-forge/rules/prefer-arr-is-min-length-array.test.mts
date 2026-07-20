import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsMinLengthArray } from './prefer-arr-is-min-length-array.mjs';

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

describe('prefer-arr-is-min-length-array', () => {
  tester.run('prefer-arr-is-min-length-array', preferArrIsMinLengthArray, {
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
      {
        name: 'ignores comparison with non-const variable',
        code: dedent`
          const xs = [1, 2, 3];
          let n = 3;
          const ok = xs.length >= n;
        `,
      },
      {
        name: 'ignores comparison with function return value',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length >= Math.floor(3.5);
        `,
      },
      {
        name: 'ignores comparison with const variable initialized by non-literal',
        code: dedent`
          const xs = [1, 2, 3];
          const n = Math.floor(3.5);
          const ok = xs.length >= n;
        `,
      },
      {
        name: 'ignores comparison with const variable of type number',
        code: dedent`
          const xs = [1, 2, 3];
          const n: number = 3;
          const ok = xs.length >= n;
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces xs.length >= n with Arr.isMinLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = xs.length >= 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isMinLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
      },
      {
        name: 'replaces n <= xs.length with Arr.isMinLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = 3 <= xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isMinLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
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
          const ok = Arr.isMinLengthArray(xs, 1);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
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
          const ok = Arr.isMinLengthArray(xs, 2);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
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
          const ok = Arr.isMinLengthArray(xs, n);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
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
          const ok = Arr.isMinLengthArray(xs, 1);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
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
          const ok1 = Arr.isMinLengthArray(xs, 2);
          const ok2 = Arr.isMinLengthArray(ys, 1);
        `,
        errors: [
          { messageId: 'useIsMinLengthArray' },
          { messageId: 'useIsMinLengthArray' },
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
          const ok = Arr.isMinLengthArray(xs, 1);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
      },
    ],
  });
}, 20000);
