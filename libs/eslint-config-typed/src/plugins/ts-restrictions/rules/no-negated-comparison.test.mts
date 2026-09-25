import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noNegatedComparison } from './no-negated-comparison.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('no-negated-comparison', () => {
  tester.run('no-negated-comparison', noNegatedComparison, {
    valid: [
      {
        name: 'a double negation converts to boolean',
        code: dedent`
          declare const a: string, b: string;
          const x = !!(a === b);
          const y = !!(a < b);
        `,
      },
      {
        name: 'a negated identifier',
        code: dedent`
          declare const a: boolean;
          const x = !a;
        `,
      },
      {
        name: 'a negated logical expression',
        code: dedent`
          declare const a: boolean, b: boolean;
          const x = !(a && b);
        `,
      },
      {
        name: '`in` has no inverse',
        code: dedent`
          declare const o: object;
          const x = !('k' in o);
        `,
      },
      {
        name: '`instanceof` has no inverse',
        code: dedent`
          declare const o: unknown;
          const x = !(o instanceof Date);
        `,
      },
      {
        name: 'an arithmetic expression',
        code: dedent`
          declare const a: number;
          const x = !(a + 1);
        `,
      },
    ],
    invalid: [
      {
        name: 'strict equality and inequality',
        code: dedent`
          declare const a: unknown, b: unknown;
          const x = !(a === b);
          const y = !(a !== b);
        `,
        output: dedent`
          declare const a: unknown, b: unknown;
          const x = a !== b;
          const y = a === b;
        `,
        errors: [
          { messageId: 'negatedComparison' },
          { messageId: 'negatedComparison' },
        ],
      },
      {
        name: 'loose equality and inequality',
        code: dedent`
          declare const a: unknown, b: unknown;
          const x = !(a == b);
          const y = !(a != b);
        `,
        output: dedent`
          declare const a: unknown, b: unknown;
          const x = a != b;
          const y = a == b;
        `,
        errors: [
          { messageId: 'negatedComparison' },
          { messageId: 'negatedComparison' },
        ],
      },
      {
        name: 'an equality of numbers is exact, NaN or not',
        code: dedent`
          declare const a: number;
          const x = !(a === 0);
        `,
        output: dedent`
          declare const a: number;
          const x = a !== 0;
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'strings are never NaN',
        code: dedent`
          declare const a: string, b: string;
          const w = !(a < b);
          const x = !(a <= b);
          const y = !(a > b);
          const z = !(a >= b);
        `,
        output: dedent`
          declare const a: string, b: string;
          const w = a >= b;
          const x = a > b;
          const y = a <= b;
          const z = a < b;
        `,
        errors: [
          { messageId: 'negatedComparison' },
          { messageId: 'negatedComparison' },
          { messageId: 'negatedComparison' },
          { messageId: 'negatedComparison' },
        ],
      },
      {
        name: 'bigints are never NaN',
        code: dedent`
          declare const a: bigint;
          const x = !(a > 0n);
        `,
        output: dedent`
          declare const a: bigint;
          const x = a <= 0n;
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'number literal types are never NaN',
        code: dedent`
          declare const a: 1 | 2;
          const x = !(a <= 1);
        `,
        output: dedent`
          declare const a: 1 | 2;
          const x = a > 1;
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'a number brand that excludes NaN',
        code: dedent`
          type ValidNumber = number & Readonly<{ NaNValue: false }>;
          declare const a: ValidNumber, b: ValidNumber;
          const x = !(a < b);
        `,
        output: dedent`
          type ValidNumber = number & Readonly<{ NaNValue: false }>;
          declare const a: ValidNumber, b: ValidNumber;
          const x = a >= b;
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'a plain number may be NaN: suggested, not fixed',
        code: dedent`
          declare const a: number;
          const x = !(a < 1);
        `,
        output: null,
        errors: [
          {
            messageId: 'negatedComparisonMaybeNaN',
            suggestions: [
              {
                messageId: 'invertComparison',
                output: dedent`
                  declare const a: number;
                  const x = a >= 1;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'a string compared with a number converts it, and may be NaN',
        code: dedent`
          declare const a: string, b: 1;
          const x = !(a < b);
        `,
        output: null,
        errors: [
          {
            messageId: 'negatedComparisonMaybeNaN',
            suggestions: [
              {
                messageId: 'invertComparison',
                output: dedent`
                  declare const a: string, b: 1;
                  const x = a >= b;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'in a condition',
        code: dedent`
          declare const a: unknown, b: unknown;
          if (!(a === b)) {
            f();
          }
        `,
        output: dedent`
          declare const a: unknown, b: unknown;
          if (a !== b) {
            f();
          }
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'in a logical expression',
        code: dedent`
          declare const a: unknown, b: unknown, c: boolean;
          const x = c && !(a === b);
        `,
        output: dedent`
          declare const a: unknown, b: unknown, c: boolean;
          const x = c && a !== b;
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'kept parenthesized where the operator would bind looser',
        code: dedent`
          declare const a: unknown, b: unknown;
          const x = -!(a === b);
          const y = !(a === b) === true;
        `,
        output: dedent`
          declare const a: unknown, b: unknown;
          const x = -(a !== b);
          const y = (a !== b) === true;
        `,
        errors: [
          { messageId: 'negatedComparison' },
          { messageId: 'negatedComparison' },
        ],
      },
      {
        name: 'a comment the fix would drop is reported without a fix',
        code: dedent`
          declare const a: unknown, b: unknown;
          const x = !/* same? */ (a === b);
        `,
        output: null,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'a comment inside the comparison is kept',
        code: dedent`
          declare const a: unknown, b: unknown;
          const x = !(a /* left */ === b);
        `,
        output: dedent`
          declare const a: unknown, b: unknown;
          const x = a /* left */ !== b;
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
      {
        name: 'a leading semicolon where the statement would join the line before',
        code: dedent`
          declare const a: unknown[], b: unknown;
          f()
          !([a][0] === b) && g();
        `,
        output: dedent`
          declare const a: unknown[], b: unknown;
          f()
          ;[a][0] !== b && g();
        `,
        errors: [{ messageId: 'negatedComparison' }],
      },
    ],
  });
});
