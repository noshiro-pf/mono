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
        name: 'ignores number arguments to Number() (the rewrite would be unsafe)',
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
        name: 'ignores never-typed arguments (string & number = never)',
        code: dedent`
          declare const x: string & number;
          const n = parseFloat(x);
        `,
      },
      {
        name: 'ignores spread arguments',
        code: dedent`
          declare const args: [string];
          const n = parseFloat(...args);
        `,
      },
      {
        name: 'ignores parseInt (handled by prefer-safe-number-parse-integer)',
        code: dedent`
          const s = "123";
          const n = parseInt(s, 10);
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
        name: 'offers no suggestion when `Result` is bound to another module',
        code: dedent`
          import { Result } from 'other-lib';

          declare const s: string;
          const n = parseFloat(s);
          export const r = Result;
        `,
        errors: [{ messageId: 'useSafeParseFloat', suggestions: [] }],
      },
      {
        // The replacement reads these strings differently ('12px' is NaN, not
        // 12; '' is NaN, not 0), so it is offered, never applied by --fix
        name: 'a string the replacement parses differently is a suggestion, not a fix',
        code: dedent`
          const a = parseFloat('12px');
          const b = Number('');
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  const a = Result.unwrapOkOr(SafeNumber.parse('12px'), Number.NaN);
                  const b = Number('');
                `,
              },
            ],
          },
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  const a = parseFloat('12px');
                  const b = Result.unwrapOkOr(SafeNumber.parse(''), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'rewrites parseFloat on a string',
        code: dedent`
          declare const s: string;
          const n = parseFloat(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'rewrites Number.parseFloat on a string',
        code: dedent`
          declare const s: string;
          const n = Number.parseFloat(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'rewrites Number(x) when x is a string',
        code: dedent`
          declare const s: string;
          const n = Number(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'adds only the missing import',
        code: dedent`
          import { Result } from 'ts-std-forge';
          declare const s: string;
          const n = parseFloat(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
                `,
              },
            ],
          },
        ],
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
      {
        name: 'ignores a string widened by `as` to a type Number() reads otherwise',
        code: dedent`
          declare const s: string;
          const n = Number(s as string | boolean);
        `,
      },
      {
        name: 'ignores `!` on an optional string, which leaves undefined in place',
        code: dedent`
          declare const s: string | undefined;
          const n = parseFloat(s!);
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
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parse(s satisfies string), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'reads the callee through `as` and `!`',
        code: dedent`
          declare const s: string;
          const a = (Number as NumberConstructor)(s);
          const b = Number!.parseFloat(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const a = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
                  const b = Number!.parseFloat(s);
                `,
              },
            ],
          },
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const a = (Number as NumberConstructor)(s);
                  const b = Result.unwrapOkOr(SafeNumber.parse(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'rewrites a string that is a string at every layer',
        code: dedent`
          declare const s: string;
          const n = parseFloat(s! as string);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parse(s! as string), Number.NaN);
                `,
              },
            ],
          },
        ],
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
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const a: number;
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parse((a, s)), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});
