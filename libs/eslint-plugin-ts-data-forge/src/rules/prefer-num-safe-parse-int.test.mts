import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferNumSafeParseInt } from './prefer-num-safe-parse-int.mjs';

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

describe('prefer-num-safe-parse-int', () => {
  tester.run('prefer-num-safe-parse-int', preferNumSafeParseInt, {
    valid: [
      {
        name: 'ignores non-base-10 radix',
        code: dedent`
          const s = "ff";
          const n = parseInt(s, 16);
        `,
      },
      {
        name: 'ignores number arguments (the rewrite would be unsafe)',
        code: dedent`
          const x = 42;
          const n = parseInt(x, 10);
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
                  import { Num, Result } from 'ts-data-forge';
                  const a = Result.unwrapOkOr(Num.safeParseInt('1e3'), Number.NaN);
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
                  import { Num, Result } from 'ts-data-forge';
                  const a = parseInt('1e3');
                  const b = Result.unwrapOkOr(Num.safeParseInt('12px'), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces parseInt(s, 10) and imports Num + Result',
        code: dedent`
          const s = "123";
          const n = parseInt(s, 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "123";
                  const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces parseInt(s) without radix',
        code: dedent`
          const s = "123";
          const n = parseInt(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "123";
                  const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces Number.parseInt(s, 10)',
        code: dedent`
          const s = "123";
          const n = Number.parseInt(s, 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "123";
                  const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'adds only the missing Result import when Num is present',
        code: dedent`
          import { Num } from 'ts-data-forge';

          const s = "123";
          const n = parseInt(s, 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';

                  const s = "123";
                  const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'wraps in parentheses in an operator context',
        code: dedent`
          const s = "123";
          const ok = parseInt(s, 10) > 5;
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "123";
                  const ok = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN) > 5;
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'preserves a complex string argument expression',
        code: dedent`
          const get = (k: string): string => k;
          const n = parseInt(get("x").trim(), 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const get = (k: string): string => k;
                  const n = Result.unwrapOkOr(Num.safeParseInt(get("x").trim()), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-num-safe-parse-int through type wrappers', () => {
  tester.run('prefer-num-safe-parse-int', preferNumSafeParseInt, {
    valid: [
      {
        name: 'a number cast to string',
        code: dedent`
          declare const n: number;
          const a = parseInt(n as unknown as string, 10);
        `,
      },
      {
        name: 'a wrapped radix other than 10',
        code: dedent`
          declare const s: string;
          const a = parseInt(s, 16 as const);
        `,
      },
    ],
    invalid: [
      {
        name: 'a radix wrapped in `as const` or `satisfies`',
        code: dedent`
          declare const s: string;
          const a = parseInt(s, 10 as const);
          const b = Number.parseInt(s!, 10 satisfies number);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
                  const b = Number.parseInt(s!, 10 satisfies number);
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
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = parseInt(s, 10 as const);
                  const b = Result.unwrapOkOr(Num.safeParseInt(s!), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'the callee read through `as` and `!`',
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
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
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
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = (parseInt as typeof parseInt)(s);
                  const b = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-num-safe-parse-int with parenthesized operands', () => {
  tester.run('prefer-num-safe-parse-int', preferNumSafeParseInt, {
    valid: [],
    invalid: [
      {
        name: 'a sequence argument keeps its parentheses',
        code: dedent`
          declare const s: string;
          declare const log: () => void;
          const a = parseInt((log(), s), 10);
        `,
        errors: [
          {
            messageId: 'useSafeParseInt',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  declare const log: () => void;
                  const a = Result.unwrapOkOr(Num.safeParseInt((log(), s)), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);
