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
      {
        name: 'ignores never-typed arguments',
        code: dedent`
          declare const x: string & number;
          const n = parseInt(x, 10);
        `,
      },
      {
        name: 'ignores unrelated calls',
        code: dedent`
          const s = "1";
          const n = Number(s);
        `,
      },
    ],
    invalid: [
      {
        name: 'offers no suggestion when `Result` is bound to another module',
        code: dedent`
          import { Result } from 'other-lib';

          declare const s: string;
          const n = parseInt(s);
          export const r = Result;
        `,
        errors: [{ messageId: 'useSafeParseInt', suggestions: [] }],
      },
      {
        // The replacement reads these strings differently ('1e3' is 1000, not
        // 1; '12px' is NaN, not 12), so it is offered, never applied by
        // --fix
        name: 'a string the replacement parses differently is a suggestion, not a fix',
        code: dedent`
          const a = parseInt('1e3');
          const b = parseInt('12px', 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  const a = Result.unwrapOkOr(SafeNumber.parseInteger('1e3'), Number.NaN);
                  const b = parseInt('12px', 10);
                `,
              },
            ],
          },
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  const a = parseInt('1e3');
                  const b = Result.unwrapOkOr(SafeNumber.parseInteger('12px'), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'rewrites parseInt without a radix',
        code: dedent`
          declare const s: string;
          const n = parseInt(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'rewrites Number.parseInt(x, 10)',
        code: dedent`
          declare const s: string;
          const n = Number.parseInt(s, 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
                `,
              },
            ],
          },
        ],
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
      {
        name: 'ignores a string widened by `as` to one that may be a number',
        code: dedent`
          declare const s: string;
          const n = parseInt(s as string | number as string);
        `,
      },
      {
        name: 'ignores `!` on an optional string, which leaves undefined in place',
        code: dedent`
          declare const s: string | undefined;
          const n = parseInt(s!);
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
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'reads a radix of 10 through `satisfies` and keeps `satisfies` on the argument',
        code: dedent`
          declare const s: string;
          const n = Number.parseInt(s satisfies string, 10 satisfies number);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parseInteger(s satisfies string), Number.NaN);
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
          const a = (parseInt as typeof parseInt)(s);
          const b = (Number as NumberConstructor)!.parseInt(s, 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const a = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
                  const b = (Number as NumberConstructor)!.parseInt(s, 10);
                `,
              },
            ],
          },
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const a = (parseInt as typeof parseInt)(s);
                  const b = Result.unwrapOkOr(SafeNumber.parseInteger(s), Number.NaN);
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
          const n = parseInt(s! as string);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parseInteger(s! as string), Number.NaN);
                `,
              },
            ],
          },
        ],
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
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result, SafeNumber } from 'ts-std-forge';
                  declare const a: number;
                  declare const s: string;
                  const n = Result.unwrapOkOr(SafeNumber.parseInteger((a, s)), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});
