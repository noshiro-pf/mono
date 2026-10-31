import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferNumSafeParseFloat } from './prefer-num-safe-parse-float.mjs';

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

describe('prefer-num-safe-parse-float', () => {
  tester.run('prefer-num-safe-parse-float', preferNumSafeParseFloat, {
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
        name: 'ignores parseInt (handled by prefer-num-safe-parse-int)',
        code: dedent`
          const s = "123";
          const n = parseInt(s, 10);
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
                  import { Num, Result } from 'ts-data-forge';
                  const a = Result.unwrapOkOr(Num.safeParseFloat('12px'), Number.NaN);
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
                  import { Num, Result } from 'ts-data-forge';
                  const a = parseFloat('12px');
                  const b = Result.unwrapOkOr(Num.safeParseFloat(''), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces parseFloat(s) and imports Num + Result',
        code: dedent`
          const s = "3.14";
          const n = parseFloat(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "3.14";
                  const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces Number.parseFloat(s)',
        code: dedent`
          const s = "3.14";
          const n = Number.parseFloat(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "3.14";
                  const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces Number(s) when s is a string',
        code: dedent`
          const s = "3.14";
          const n = Number(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "3.14";
                  const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
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

          const s = "3.14";
          const n = parseFloat(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';

                  const s = "3.14";
                  const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
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
          const n = parseFloat(get("x").trim());
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const get = (k: string): string => k;
                  const n = Result.unwrapOkOr(Num.safeParseFloat(get("x").trim()), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces Number(s) with a string literal argument',
        code: dedent`
          const n = Number("3.14");
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const n = Result.unwrapOkOr(Num.safeParseFloat("3.14"), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
      {
        name: 'replaces all three forms in one file',
        code: dedent`
          const s = "1.5";
          const a = parseFloat(s);
          const b = Number.parseFloat(s);
          const c = Number(s);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  const s = "1.5";
                  const a = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
                  const b = Number.parseFloat(s);
                  const c = Number(s);
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
                  import { Num, Result } from 'ts-data-forge';
                  const s = "1.5";
                  const a = parseFloat(s);
                  const b = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
                  const c = Number(s);
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
                  import { Num, Result } from 'ts-data-forge';
                  const s = "1.5";
                  const a = parseFloat(s);
                  const b = Number.parseFloat(s);
                  const c = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-num-safe-parse-float through type wrappers', () => {
  tester.run('prefer-num-safe-parse-float', preferNumSafeParseFloat, {
    valid: [
      {
        name: 'an unknown value cast to string',
        code: dedent`
          declare const v: unknown;
          const a = Number(v as string);
          const b = parseFloat(<string>v);
        `,
      },
      {
        name: 'a number cast to string',
        code: dedent`
          declare const n: number;
          const a = Number(n as unknown as string);
        `,
      },
      {
        name: 'a string whose type a middle layer does not vouch for',
        code: dedent`
          declare const s: string;
          const a = Number(s as unknown as string);
        `,
      },
      {
        name: 'a `!` that leaves null in place (`Number(null)` is 0)',
        code: dedent`
          declare const s: string | null;
          const a = Number(s!);
        `,
      },
    ],
    invalid: [
      {
        name: 'a string argument keeps its wrapper',
        code: dedent`
          declare const s: string;
          const a = Number(s!);
          const b = parseFloat(s satisfies string);
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = Result.unwrapOkOr(Num.safeParseFloat(s!), Number.NaN);
                  const b = parseFloat(s satisfies string);
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
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = Number(s!);
                  const b = Result.unwrapOkOr(Num.safeParseFloat(s satisfies string), Number.NaN);
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
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
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
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  const a = (Number as NumberConstructor)(s);
                  const b = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-num-safe-parse-float with parenthesized operands', () => {
  tester.run('prefer-num-safe-parse-float', preferNumSafeParseFloat, {
    valid: [],
    invalid: [
      {
        name: 'a sequence argument keeps its parentheses',
        code: dedent`
          declare const s: string;
          declare const log: () => void;
          const a = Number((log(), s));
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Num, Result } from 'ts-data-forge';
                  declare const s: string;
                  declare const log: () => void;
                  const a = Result.unwrapOkOr(Num.safeParseFloat((log(), s)), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
}, 20000);
