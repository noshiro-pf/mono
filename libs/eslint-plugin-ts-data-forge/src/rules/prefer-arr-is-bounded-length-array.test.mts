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
            const ok = Arr.isBoundedLengthArray(1, 5, xs);
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
            const ok = Arr.isBoundedLengthArray(1, 5, xs);
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
            const ok = Arr.isBoundedLengthArray(1, 5, xs);
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
            const ok = Arr.isBoundedLengthArray(lo, hi, xs);
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
            const ok = Arr.isBoundedLengthArray(1, 5, xs);
          `,
          errors: [{ messageId: 'useIsBoundedLengthArray' }],
        },
      ],
    },
  );
}, 20000);

describe('prefer-arr-is-bounded-length-array through type wrappers', () => {
  tester.run(
    'prefer-arr-is-bounded-length-array',
    preferArrIsBoundedLengthArray,
    {
      valid: [
        {
          name: 'a computed index named `length` is not the length',
          code: dedent`
            declare const xs: readonly number[];
            declare const length: number;
            const ok = xs[length] >= 1 && xs.length <= 3;
          `,
        },
      ],
      invalid: [
        {
          name: 'the array, the length and the bounds wrapped',
          code: dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            const a = xs.length >= 1 && (xs as readonly number[]).length <= 3;
            const b = (xs.length satisfies number) >= (1 as number) && xs!.length <= 3;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            const a = Arr.isBoundedLengthArray(1, 3, xs);
            const b = Arr.isBoundedLengthArray(1, 3, xs);
          `,
          errors: [
            { messageId: 'useIsBoundedLengthArray' },
            { messageId: 'useIsBoundedLengthArray' },
          ],
        },
      ],
    },
  );
}, 20000);

describe('prefer-arr-is-bounded-length-array with parenthesized operands', () => {
  tester.run(
    'prefer-arr-is-bounded-length-array',
    preferArrIsBoundedLengthArray,
    {
      valid: [],
      invalid: [
        {
          name: 'a sequence array keeps its parentheses',
          code: dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            declare const log: () => void;
            const ok = (log(), xs).length >= 1 && (log(), xs).length <= 3;
          `,
          output: dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            declare const log: () => void;
            const ok = Arr.isBoundedLengthArray(1, 3, (log(), xs));
          `,
          errors: [{ messageId: 'useIsBoundedLengthArray' }],
        },
      ],
    },
  );
}, 20000);
