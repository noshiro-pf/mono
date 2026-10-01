import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrIsNonEmpty } from './prefer-arr-is-non-empty.mjs';

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

describe('prefer-arr-is-non-empty', () => {
  tester.run('prefer-arr-is-non-empty', preferArrIsNonEmpty, {
    valid: [
      {
        name: 'ignores non-array types',
        code: dedent`
          const str = "hello";
          const ok = str.length > 0;
        `,
      },
      {
        name: 'ignores other comparisons',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length >= 1;
        `,
      },
      {
        name: 'ignores comparisons with non-zero',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length > 1;
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces xs.length > 0 with Arr.isNonEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'replaces 0 < xs.length with Arr.isNonEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = 0 < xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'keeps existing Arr import',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-non-empty through type wrappers', () => {
  tester.run('prefer-arr-is-non-empty', preferArrIsNonEmpty, {
    valid: [
      {
        name: 'a type that says `0` is not the value `0`: only a literal is read through its wrapper',
        code: dedent`
          declare const xs: readonly number[];
          declare const n: number;
          const a = xs.length > (n as 0);
        `,
      },
      {
        name: 'a computed index named `length` is not the length',
        code: dedent`
          declare const xs: readonly number[];
          declare const length: number;
          const a = xs[length] > 0;
          const b = xs[length]! > 0;
        `,
      },
      {
        name: 'a string cast to an array',
        code: dedent`
          declare const s: string;
          const ok = (s as unknown as readonly string[]).length > 0;
        `,
      },
    ],
    invalid: [
      {
        name: 'the length or the zero wrapped',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = (xs.length satisfies number) > 0;
          const b = xs.length > (0 as number);
          const c = 0 < xs.length!;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = Arr.isNonEmpty(xs);
          const b = Arr.isNonEmpty(xs);
          const c = Arr.isNonEmpty(xs);
        `,
        errors: [
          { messageId: 'useIsNonEmpty' },
          { messageId: 'useIsNonEmpty' },
          { messageId: 'useIsNonEmpty' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-arr-is-non-empty with parenthesized operands', () => {
  tester.run('prefer-arr-is-non-empty', preferArrIsNonEmpty, {
    valid: [],
    invalid: [
      {
        name: 'a sequence array keeps its parentheses',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = (log(), xs).length > 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = Arr.isNonEmpty((log(), xs));
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
    ],
  });
}, 20000);
