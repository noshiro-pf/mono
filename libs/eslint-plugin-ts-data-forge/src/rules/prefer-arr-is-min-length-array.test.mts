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
          const ok = Arr.isMinLengthArray(3, xs);
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
          const ok = Arr.isMinLengthArray(3, xs);
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
          const ok = Arr.isMinLengthArray(1, xs);
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
          const ok = Arr.isMinLengthArray(2, xs);
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
          const ok = Arr.isMinLengthArray(n, xs);
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
          const ok = Arr.isMinLengthArray(1, xs);
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
          const ok1 = Arr.isMinLengthArray(2, xs);
          const ok2 = Arr.isMinLengthArray(1, ys);
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
          const ok = Arr.isMinLengthArray(1, xs);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-min-length-array through type wrappers', () => {
  tester.run('prefer-arr-is-min-length-array', preferArrIsMinLengthArray, {
    valid: [
      {
        name: 'a computed index named `length` is not the length',
        code: dedent`
          declare const xs: readonly number[];
          declare const length: number;
          const ok = xs[length] >= 2;
        `,
      },
      {
        name: 'the lower half of a bounded pair whose other half is wrapped',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length >= 1 && (xs as readonly number[]).length <= 3;
        `,
      },
    ],
    invalid: [
      {
        name: 'the length or the bound wrapped',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = (xs.length satisfies number) >= 2;
          const b = xs.length >= (2 as number);
          const c = (3 satisfies number) <= xs.length!;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = Arr.isMinLengthArray(2, xs);
          const b = Arr.isMinLengthArray(2, xs);
          const c = Arr.isMinLengthArray(3, xs);
        `,
        errors: [
          { messageId: 'useIsMinLengthArray' },
          { messageId: 'useIsMinLengthArray' },
          { messageId: 'useIsMinLengthArray' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-min-length-array with parenthesized operands', () => {
  tester.run('prefer-arr-is-min-length-array', preferArrIsMinLengthArray, {
    valid: [],
    invalid: [
      {
        name: 'a sequence array keeps its parentheses',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = (log(), xs).length >= 2;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = Arr.isMinLengthArray(2, (log(), xs));
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
      },
    ],
  });
}, 20000);
