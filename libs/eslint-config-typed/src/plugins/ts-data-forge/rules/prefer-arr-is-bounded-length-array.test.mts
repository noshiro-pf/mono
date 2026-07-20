import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsBoundedLengthArray } from './prefer-arr-is-bounded-length-array.mjs';

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

describe('prefer-arr-is-bounded-length-array', () => {
  tester.run(
    'prefer-arr-is-bounded-length-array',
    preferArrIsBoundedLengthArray,
    {
      valid: [
        {
          name: 'ignores non-array types',
          code: dedent`
            const str = "hello";
            const ok = str.length >= 1 && str.length <= 5;
          `,
        },
        {
          name: 'ignores a single min bound',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length >= 1;
          `,
        },
        {
          name: 'ignores a single max bound',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length <= 5;
          `,
        },
        {
          name: 'ignores two bounds of the same kind',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length >= 1 && xs.length >= 2;
          `,
        },
        {
          name: 'ignores bounds on different arrays',
          code: dedent`
            const xs = [1, 2, 3];
            const ys = [4, 5];
            const ok = xs.length >= 1 && ys.length <= 5;
          `,
        },
        {
          name: 'ignores || combinations',
          code: dedent`
            const xs = [1, 2, 3];
            const ok = xs.length >= 1 || xs.length <= 5;
          `,
        },
        {
          name: 'ignores comparison with non-const variable',
          code: dedent`
            const xs = [1, 2, 3];
            let lo = 1;
            const ok = xs.length >= lo && xs.length <= 5;
          `,
        },
      ],
      invalid: [
        {
          name: 'replaces min && max with Arr.isBoundedLengthArray',
          code: dedent`
            const xs: readonly number[] = [1, 2, 3];
            const ok = xs.length >= 1 && xs.length <= 5;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs: readonly number[] = [1, 2, 3];
            const ok = Arr.isBoundedLengthArray(xs, 1, 5);
          `,
          errors: [{ messageId: 'useIsBoundedLengthArray' }],
        },
        {
          name: 'normalizes max && min ordering to (min, max)',
          code: dedent`
            const xs: readonly number[] = [1, 2, 3];
            const ok = xs.length <= 5 && xs.length >= 1;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs: readonly number[] = [1, 2, 3];
            const ok = Arr.isBoundedLengthArray(xs, 1, 5);
          `,
          errors: [{ messageId: 'useIsBoundedLengthArray' }],
        },
        {
          name: 'handles reversed operand order in each comparison',
          code: dedent`
            const xs: readonly number[] = [1, 2, 3];
            const ok = 1 <= xs.length && 5 >= xs.length;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs: readonly number[] = [1, 2, 3];
            const ok = Arr.isBoundedLengthArray(xs, 1, 5);
          `,
          errors: [{ messageId: 'useIsBoundedLengthArray' }],
        },
        {
          name: 'works with const variable bounds',
          code: dedent`
            const xs = [1, 2, 3];
            const lo = 1;
            const hi = 5;
            const ok = xs.length >= lo && xs.length <= hi;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            const xs = [1, 2, 3];
            const lo = 1;
            const hi = 5;
            const ok = Arr.isBoundedLengthArray(xs, lo, hi);
          `,
          errors: [{ messageId: 'useIsBoundedLengthArray' }],
        },
        {
          name: 'keeps existing Arr import',
          code: dedent`
            import { Arr } from 'ts-data-forge';

            const xs = [1, 2, 3];
            const ok = xs.length >= 1 && xs.length <= 5;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';

            const xs = [1, 2, 3];
            const ok = Arr.isBoundedLengthArray(xs, 1, 5);
          `,
          errors: [{ messageId: 'useIsBoundedLengthArray' }],
        },
      ],
    },
  );
}, 20000);
