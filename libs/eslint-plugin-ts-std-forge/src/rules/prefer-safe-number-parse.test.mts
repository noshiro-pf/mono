import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferSafeNumberParse } from './prefer-safe-number-parse.mjs';

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

describe('prefer-safe-number-parse', () => {
  tester.run('prefer-safe-number-parse', preferSafeNumberParse, {
    valid: [
      {
        name: 'ignores number arguments to Number() (autofix would be unsafe)',
        code: dedent`
          const x = 42;
          const n = Number(x);
        `,
      },
      {
        name: 'ignores boolean arguments to Number()',
        code: dedent`
          const b = true;
          const n = Number(b);
        `,
      },
      {
        name: 'ignores a union that is not purely string',
        code: dedent`
          declare const s: string | undefined;
          const n = parseFloat(s as string | undefined as string & never);
        `,
      },
      {
        name: 'ignores new Number(...)',
        code: dedent`
          const s = '1';
          const n = new Number(s);
        `,
      },
    ],
    invalid: [
      {
        name: 'rewrites parseFloat on a string',
        code: dedent`
          declare const s: string;
          const n = parseFloat(s);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParse' }],
      },
      {
        name: 'rewrites Number.parseFloat on a string',
        code: dedent`
          declare const s: string;
          const n = Number.parseFloat(s);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParse' }],
      },
      {
        name: 'rewrites Number(x) when x is a string',
        code: dedent`
          declare const s: string;
          const n = Number(s);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParse' }],
      },
      {
        name: 'adds only the missing import',
        code: dedent`
          import { Result } from 'ts-std-forge';
          declare const s: string;
          const n = parseFloat(s);
        `,
        output: dedent`
          import { SafeNumber } from 'ts-std-forge';
          import { Result } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParse' }],
      },
    ],
  });
});

describe('prefer-safe-number-parse through type wrappers', () => {
  tester.run('prefer-safe-number-parse', preferSafeNumberParse, {
    valid: [
      {
        name: 'ignores a boolean cast to string, which Number() reads as 0 or 1',
        code: dedent`
          declare const b: boolean;
          const n = Number(b as unknown as string);
        `,
      },
      {
        name: 'ignores a number cast to string with `<T>`',
        code: dedent`
          declare const x: number;
          const n = Number(<string>(<unknown>x));
        `,
      },
      {
        name: 'ignores a union made to look like a string with `!`',
        code: dedent`
          declare const x: string | number | undefined;
          const n = parseFloat(x! as string);
        `,
      },
    ],
    invalid: [
      {
        name: 'keeps `satisfies` on a string argument',
        code: dedent`
          declare const s: string;
          const n = Number(s satisfies string);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parse(s satisfies string), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParse' }],
      },
      {
        name: 'reads the callee through `as` and `!`',
        code: dedent`
          declare const s: string;
          const a = (Number as NumberConstructor)(s);
          const b = Number!.parseFloat(s);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string;
          const a = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
          const b = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
        `,
        errors: [
          { messageId: 'useSafeNumberParse' },
          { messageId: 'useSafeNumberParse' },
        ],
      },
      {
        name: 'reads `!` on an optional string as the string it asserts',
        code: dedent`
          declare const s: string | undefined;
          const n = parseFloat(s!);
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const s: string | undefined;
          const n = Result.unwrapOkOr(SafeNumber.parse(s!), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParse' }],
      },
    ],
  });
});

describe('prefer-safe-number-parse with parenthesized operands', () => {
  tester.run('prefer-safe-number-parse', preferSafeNumberParse, {
    valid: [],
    invalid: [
      {
        name: 'keeps the parentheses of a sequence argument',
        code: dedent`
          declare const a: number;
          declare const s: string;
          const n = parseFloat((a, s));
        `,
        output: dedent`
          import { Result, SafeNumber } from 'ts-std-forge';
          declare const a: number;
          declare const s: string;
          const n = Result.unwrapOkOr(SafeNumber.parse((a, s)), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeNumberParse' }],
      },
    ],
  });
});
