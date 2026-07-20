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
