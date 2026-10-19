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
        name: 'a sequence begin keeps its parentheses',
        code: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          declare const log: () => void;
          for (let i = (log(), 0); i < n; ++i) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          declare const log: () => void;
          for (const i of range((log(), 0), n)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);

describe('prefer-range-for-loop where the rewrite would change behavior', () => {
  tester.run('prefer-range-for-loop', preferRangeForLoop, {
    valid: [
      {
        // `const i` could not be assigned.
        name: 'the loop variable assigned in the body',
        code: dedent`
          declare const n: number;
          declare const skip: boolean;
          for (let i = 0; i < n; ++i) {
            if (skip) i += 1;
          }
          for (let j = 0; j < n; ++j) {
            j = n;
          }
        `,
      },
      {
        // `range` takes safe integers only.
        name: 'a step or a begin that is not an integer',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += 0.5) {
            console.log(i);
          }
          for (let j = 0.5; j < n; ++j) {
            console.log(j);
          }
        `,
      },
      {
        // `i < n` with a negative step never ends; `range` yields nothing.
        name: 'a negative literal step',
        code: dedent`
          declare const n: number;
          for (let i = 0; i < n; i += -1) {
            console.log(i);
          }
        `,
      },
    ],
    invalid: [
      {
        // The loop tests its end on every iteration; `range` reads it once.
        name: 'an end that is not a literal or a never-reassigned variable gets no fix',
        code: dedent`
          declare const xs: number[];
          declare const getN: () => number;
          let m = 3;
          for (let i = 0; i < xs.length; ++i) {
            xs.pop();
          }
          for (let j = 0; j < getN(); ++j) {
            console.log(j);
          }
          for (let k = 0; k < m; ++k) {
            m -= 1;
          }
        `,
        output: null,
        errors: [
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
          { messageId: 'useRangeForLoop' },
        ],
      },
      {
        // The loop adds the step it reads on each iteration; `range` reads it
        // once.
        name: 'a variable step that is reassigned gets no fix',
        code: dedent`
          declare const n: number;
          let step = 1;
          for (let i = 0; i < n; i += step) {
            step *= 2;
          }
        `,
        output: null,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        // The type checker judges it: a `number` step makes the fixed call
        // fail to type-check.
        name: 'a variable step is fixed without asking its type',
        code: dedent`
          declare const n: number;
          declare const step: number;
          for (let i = 0; i < n; i += step) {
            console.log(i);
          }
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          declare const n: number;
          declare const step: number;
          for (const i of range(0, n, step)) {
            console.log(i);
          }
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
      {
        name: 'a parameter that is never reassigned is a fixed end',
        code: dedent`
          const f = (n: number): void => {
            for (let i = 0; i < n; ++i) {
              console.log(i);
            }
          };
        `,
        output: dedent`
          import { range } from 'ts-data-forge';
          const f = (n: number): void => {
            for (const i of range(0, n)) {
              console.log(i);
            }
          };
        `,
        errors: [{ messageId: 'useRangeForLoop' }],
      },
    ],
  });
}, 20000);
