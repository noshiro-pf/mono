import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsFixedLengthArray } from './prefer-arr-is-fixed-length-array.mjs';

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

describe('prefer-arr-is-fixed-length-array', () => {
  tester.run('prefer-arr-is-fixed-length-array', preferArrIsFixedLengthArray, {
    valid: [
      {
        name: 'ignores non-array types',
        code: dedent`
          const str = "hello";
          const ok = str.length === 5;
        `,
      },
      {
        name: 'ignores other comparisons',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length > 0;
        `,
      },
      {
        name: 'ignores comparison with non-const variable',
        code: dedent`
          const xs = [1, 2, 3];
          let n = 3;
          const ok = xs.length === n;
        `,
      },
      {
        name: 'ignores comparison with function return value',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length === Math.floor(3.5);
        `,
      },
      {
        name: 'ignores comparison with const variable initialized by non-literal',
        code: dedent`
          const xs = [1, 2, 3];
          const n = Math.floor(3.5);
          const ok = xs.length === n;
        `,
      },
      {
        name: 'ignores comparison with const variable of type number',
        code: dedent`
          const xs = [1, 2, 3];
          const n: number = 3;
          const ok = xs.length === n;
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces xs.length === n with Arr.isFixedLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = xs.length === 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'replaces n === xs.length with Arr.isFixedLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = 3 === xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'works with no type annotation',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length === 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'works with const assertion',
        code: dedent`
          const xs = [1, 2, 3] as const;
          const ok = xs.length === 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3] as const;
          const ok = Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'works with variable length',
        code: dedent`
          const xs = [1, 2, 3];
          const n = 3;
          const ok = xs.length === n;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const n = 3;
          const ok = Arr.isFixedLengthArray(xs, n);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'keeps existing Arr import',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = xs.length === 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'replaces multiple checks',
        code: dedent`
          const xs = [1, 2, 3];
          const ys = [4, 5];
          const ok1 = xs.length === 3;
          const ok2 = ys.length === 2;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ys = [4, 5];
          const ok1 = Arr.isFixedLengthArray(xs, 3);
          const ok2 = Arr.isFixedLengthArray(ys, 2);
        `,
        errors: [
          { messageId: 'useIsFixedLengthArray' },
          { messageId: 'useIsFixedLengthArray' },
        ],
      },
      {
        name: 'replaces xs.length !== n with !Arr.isFixedLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = xs.length !== 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = !Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'replaces n !== xs.length with !Arr.isFixedLengthArray',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = 3 !== xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = !Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
      {
        name: 'works with !== and no type annotation',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length !== 5;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = !Arr.isFixedLengthArray(xs, 5);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
    ],
  });
}, 20000);
