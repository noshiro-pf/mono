import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferRangeForLoop } from './prefer-range-for-loop.mjs';

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

describe('prefer-range-for-loop', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [
      {
        name: 'ignores for loop with const',
        code: dedent`
          for (const i = 0; i < 10; ++i) {
            console.log(i);
          }
        `,
      },
      {
        name: 'ignores for loop with different condition',
        code: dedent`
          for (let i = 0; i <= 10; ++i) {
            console.log(i);
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces for loop with ++i',
        code: dedent`
          for (let i = 0; i < 10; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'replaces for loop with i++',
        code: dedent`
          for (let i = 0; i < 10; i++) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'replaces for loop with i += 1',
        code: dedent`
          for (let i = 0; i < 10; i += 1) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'replaces for loop with variable bounds',
        code: dedent`
          const begin = 5;
          const end = 15;
          for (let j = begin; j < end; ++j) {
            console.log(j);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          const begin = 5;
          const end = 15;
          for (const j of range(begin, end)) {
            console.log(j);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      // {
      //   name: 'replaces for loop with different condition',
      //   code: dedent`
      //     for (let i = 0; i <= 10; ++i) {
      //       console.log(i);
      //     }
      //   `,
      //   output: dedent`
      //     import { range } from 'ts-data-forge';
      //     for (const i of range(0, 11)) {
      //       console.log(i);
      //     }
      //   `,
      //   errors: [{ messageId: 'useRangeForLoop' }],
      // },
      {
        name: 'replaces for loop with i += 2',
        code: dedent`
          for (let i = 0; i < 10; i += 2) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          for (const i of range(0, 10, 2)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },

      {
        name: 'keeps existing range import',
        code: dedent`
          import { range } from 'ts-data-forge';

          for (let i = 0; i < 10; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';

          for (const i of range(0, 10)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop through type wrappers', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [
      {
        name: 'a wrapped non-positive step',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += 0 as number) {
            console.log(i);
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'the loop variable or the step wrapped',
        code: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          for (let i = 0; (i satisfies number) < n; ++i) {
            console.log(i);
          }
          for (let j = 0; j! < n; j += 2 as number) {
            console.log(j);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          for (const i of range(0, n)) {
            console.log(i);
          }
          for (const j of range(0, n, 2)) {
            console.log(j);
          }
        `,
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop with parenthesized operands', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [],
    invalid: [
      {
        name: 'sequence bounds and step keep their parentheses',
        code: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          declare const step: number;
          declare const log: () => void;
          for (let i = (log(), 0); i < (log(), n); i += (log(), step)) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          declare const step: number;
          declare const log: () => void;
          for (const i of range((log(), 0), (log(), n), (log(), step))) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);
