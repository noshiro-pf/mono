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
          const ok = Arr.isMaxLengthArray(3, xs);
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
          const ok = Arr.isMaxLengthArray(3, xs);
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
          const ok = Arr.isMaxLengthArray(1, xs);
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
          const ok = Arr.isMaxLengthArray(2, xs);
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
          const ok = Arr.isMaxLengthArray(n, xs);
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
          const ok = Arr.isMaxLengthArray(1, xs);
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
          const ok1 = Arr.isMaxLengthArray(2, xs);
          const ok2 = Arr.isMaxLengthArray(1, ys);
        `,
        errors: [
          { messageId: 'useIsMaxLengthArray' },
          { messageId: 'useIsMaxLengthArray' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-max-length-array through type wrappers', () => {
  tester.run('prefer-arr-is-max-length-array', preferArrIsMaxLengthArray, {
    valid: [
      {
        name: 'a computed index named `length` is not the length',
        code: dedent`
          declare const xs: readonly number[];
          declare const length: number;
          const ok = xs[length] <= 2;
        `,
      },
      {
        name: 'the upper half of a bounded pair whose other half is wrapped',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs!.length >= 1 && xs.length <= 3;
        `,
      },
    ],
    invalid: [
      {
        name: 'the length or the bound wrapped',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = (xs.length satisfies number) <= 2;
          const b = xs.length <= (2 as number);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = Arr.isMaxLengthArray(2, xs);
          const b = Arr.isMaxLengthArray(2, xs);
        `,
        errors: [
          { messageId: 'useIsMaxLengthArray' },
          { messageId: 'useIsMaxLengthArray' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-max-length-array with parenthesized operands', () => {
  tester.run('prefer-arr-is-max-length-array', preferArrIsMaxLengthArray, {
    valid: [],
    invalid: [
      {
        name: 'a sequence array keeps its parentheses',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = (log(), xs).length <= 2;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = Arr.isMaxLengthArray(2, (log(), xs));
        `,
        errors: [{ messageId: 'useIsMaxLengthArray' }],
      },
    ],
  });
}, 20000);
