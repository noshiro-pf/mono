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
          const ok = Arr.isFixedLengthArray(3, xs);
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
          const ok = Arr.isFixedLengthArray(3, xs);
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
          const ok = Arr.isFixedLengthArray(3, xs);
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
          const ok = Arr.isFixedLengthArray(3, xs);
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
          const ok = Arr.isFixedLengthArray(n, xs);
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
          const ok = Arr.isFixedLengthArray(3, xs);
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
          const ok1 = Arr.isFixedLengthArray(3, xs);
          const ok2 = Arr.isFixedLengthArray(2, ys);
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
          const ok = !Arr.isFixedLengthArray(3, xs);
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
          const ok = !Arr.isFixedLengthArray(3, xs);
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
          const ok = !Arr.isFixedLengthArray(5, xs);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-fixed-length-array through type wrappers', () => {
  tester.run('prefer-arr-is-fixed-length-array', preferArrIsFixedLengthArray, {
    valid: [
      {
        name: 'a computed index named `length` is not the length',
        code: dedent`
          declare const xs: readonly number[];
          declare const length: number;
          const ok = xs[length] === 3;
        `,
      },
    ],
    invalid: [
      {
        name: 'the length or the bound wrapped',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = xs.length === (3 satisfies number);
          const b = (xs.length as number) !== 3;
          const c = (2 as number) === xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = Arr.isFixedLengthArray(3, xs);
          const b = !Arr.isFixedLengthArray(3, xs);
          const c = Arr.isFixedLengthArray(2, xs);
        `,
        errors: [
          { messageId: 'useIsFixedLengthArray' },
          { messageId: 'useIsFixedLengthArray' },
          { messageId: 'useIsFixedLengthArray' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-fixed-length-array with parenthesized operands', () => {
  tester.run('prefer-arr-is-fixed-length-array', preferArrIsFixedLengthArray, {
    valid: [],
    invalid: [
      {
        name: 'a sequence array keeps its parentheses',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = (log(), xs).length === 2;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = Arr.isFixedLengthArray(2, (log(), xs));
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
    ],
  });
}, 20000);
