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
