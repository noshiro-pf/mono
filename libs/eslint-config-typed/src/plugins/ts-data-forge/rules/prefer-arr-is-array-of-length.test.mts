import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsArrayOfLength } from './prefer-arr-is-array-of-length.mjs';

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

describe('prefer-arr-is-array-of-length', () => {
  tester.run('prefer-arr-is-array-of-length', preferArrIsArrayOfLength, {
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
    ],
    invalid: [
      {
        name: 'replaces xs.length === n with Arr.isArrayOfLength',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = xs.length === 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isArrayOfLength(xs, 3);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
      },
      {
        name: 'replaces n === xs.length with Arr.isArrayOfLength',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = 3 === xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = Arr.isArrayOfLength(xs, 3);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
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
          const ok = Arr.isArrayOfLength(xs, 3);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
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
          const ok = Arr.isArrayOfLength(xs, 3);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
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
          const ok = Arr.isArrayOfLength(xs, n);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
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
          const ok = Arr.isArrayOfLength(xs, 3);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
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
          const ok1 = Arr.isArrayOfLength(xs, 3);
          const ok2 = Arr.isArrayOfLength(ys, 2);
        `,
        errors: [
          { messageId: 'useIsArrayOfLength' },
          { messageId: 'useIsArrayOfLength' },
        ],
      },
      {
        name: 'replaces xs.length !== n with !Arr.isArrayOfLength',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = xs.length !== 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = !Arr.isArrayOfLength(xs, 3);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
      },
      {
        name: 'replaces n !== xs.length with !Arr.isArrayOfLength',
        code: dedent`
          const xs: readonly number[] = [1, 2, 3];
          const ok = 3 !== xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs: readonly number[] = [1, 2, 3];
          const ok = !Arr.isArrayOfLength(xs, 3);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
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
          const ok = !Arr.isArrayOfLength(xs, 5);
        `,
        errors: [{ messageId: 'useIsArrayOfLength' }],
      },
    ],
  });
}, 20000);
