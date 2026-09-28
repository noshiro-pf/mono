import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferSafeNumberParseInteger } from './prefer-safe-number-parse-integer.mjs';

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

describe('prefer-safe-number-parse-integer', () => {
  tester.run('prefer-safe-number-parse-integer', preferSafeNumberParseInteger, {
    valid: [
      {
        name: 'ignores a radix other than 10',
        code: dedent`
          declare const s: string;
          const n = parseInt(s, 16);
        `,
      },
      {
        name: 'ignores a non-string argument',
        code: dedent`
          declare const x: number;
          const n = parseInt(x as unknown as string & never, 10);
        `,
      },
    ],
    invalid: [
      {
        name: 'rewrites parseInt without a radix',
        code: dedent`
          declare const s: string;
          const n = parseInt(s);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParseInteger' }],
      },
      {
        name: 'rewrites Number.parseInt(x, 10)',
        code: dedent`
          declare const s: string;
          const n = Number.parseInt(s, 10);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParseInteger' }],
      },
    ],
  });
});

describe('prefer-safe-number-parse-integer through type wrappers', () => {
  tester.run('prefer-safe-number-parse-integer', preferSafeNumberParseInteger, {
    valid: [
      {
        // `parseInt(1e21)` is 1, `SafeNumber.parseInteger(1e21)` is 1e21.
        name: 'ignores a number cast to string',
        code: dedent`
          declare const x: number;
          const n = parseInt(x as unknown as string);
        `,
      },
      {
        name: 'ignores a radix other than 10 behind `as const`',
        code: dedent`
          declare const s: string;
          const n = parseInt(s, 16 as const);
        `,
      },
    ],
    invalid: [
      {
        name: 'reads a radix of 10 through `as const`',
        code: dedent`
          declare const s: string;
          const n = parseInt(s, 10 as const);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParseInteger' }],
      },
      {
        name: 'reads a radix of 10 through `satisfies` and keeps `satisfies` on the argument',
        code: dedent`
          declare const s: string;
          const n = Number.parseInt(s satisfies string, 10 satisfies number);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parseInteger(s satisfies string), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParseInteger' }],
      },
      {
        name: 'reads the callee through `as` and `!`',
        code: dedent`
          declare const s: string;
          const a = (parseInt as typeof parseInt)(s);
          const b = (Number as NumberConstructor)!.parseInt(s, 10);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const a = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
          const b = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
        `,
        errors: [
          { messageId: 'useSafeNumberParseInteger' },
          { messageId: 'useSafeNumberParseInteger' },
        ],
      },
      {
        name: 'reads `!` on an optional string as the string it asserts',
        code: dedent`
          declare const s: string | undefined;
          const n = parseInt(s!);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string | undefined;
          const n = Result.unwrapOkOr(SafeNumber.parseInteger(s!), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParseInteger' }],
      },
    ],
  });
});

describe('prefer-safe-number-parse-integer with parenthesized operands', () => {
  tester.run('prefer-safe-number-parse-integer', preferSafeNumberParseInteger, {
    valid: [],
    invalid: [
      {
        name: 'keeps the parentheses of a sequence argument',
        code: dedent`
          declare const a: number;
          declare const s: string;
          const n = parseInt((a, s), (10));
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const a: number;
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parseInteger((a, s)), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParseInteger' }],
      },
    ],
  });
});
