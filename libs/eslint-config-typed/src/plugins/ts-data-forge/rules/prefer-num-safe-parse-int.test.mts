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
        name: 'ignores number arguments (autofix would be unsafe)',
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
        name: 'replaces parseInt(s, 10) and imports Num + Result',
        code: dedent`
          const s = "123";
          const n = parseInt(s, 10);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "123";
          const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseInt' }],
      },
      {
        name: 'replaces parseInt(s) without radix',
        code: dedent`
          const s = "123";
          const n = parseInt(s);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "123";
          const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseInt' }],
      },
      {
        name: 'replaces Number.parseInt(s, 10)',
        code: dedent`
          const s = "123";
          const n = Number.parseInt(s, 10);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "123";
          const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseInt' }],
      },
      {
        name: 'adds only the missing Result import when Num is present',
        code: dedent`
          import { Num } from 'ts-data-forge';

          const s = "123";
          const n = parseInt(s, 10);
        `,
        output: dedent`
          import { Result } from 'ts-data-forge';
          import { Num } from 'ts-data-forge';

          const s = "123";
          const n = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseInt' }],
      },
      {
        name: 'wraps in parentheses in an operator context',
        code: dedent`
          const s = "123";
          const ok = parseInt(s, 10) > 5;
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "123";
          const ok = Result.unwrapOkOr(Num.safeParseInt(s), Number.NaN) > 5;
        `,
        errors: [{ messageId: 'useSafeParseInt' }],
      },
      {
        name: 'preserves a complex string argument expression',
        code: dedent`
          const get = (k: string): string => k;
          const n = parseInt(get("x").trim(), 10);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const get = (k: string): string => k;
          const n = Result.unwrapOkOr(Num.safeParseInt(get("x").trim()), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseInt' }],
      },
    ],
  });
}, 20000);
