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
        name: 'replaces parseFloat(s) and imports Num + Result',
        code: dedent`
          const s = "3.14";
          const n = parseFloat(s);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "3.14";
          const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseFloat' }],
      },
      {
        name: 'replaces Number.parseFloat(s)',
        code: dedent`
          const s = "3.14";
          const n = Number.parseFloat(s);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "3.14";
          const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseFloat' }],
      },
      {
        name: 'replaces Number(s) when s is a string',
        code: dedent`
          const s = "3.14";
          const n = Number(s);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "3.14";
          const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseFloat' }],
      },
      {
        name: 'adds only the missing Result import when Num is present',
        code: dedent`
          import { Num } from 'ts-data-forge';

          const s = "3.14";
          const n = parseFloat(s);
        `,
        output: dedent`
          import { Result } from 'ts-data-forge';
          import { Num } from 'ts-data-forge';

          const s = "3.14";
          const n = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseFloat' }],
      },
      {
        name: 'preserves a complex string argument expression',
        code: dedent`
          const get = (k: string): string => k;
          const n = parseFloat(get("x").trim());
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const get = (k: string): string => k;
          const n = Result.unwrapOkOr(Num.safeParseFloat(get("x").trim()), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseFloat' }],
      },
      {
        name: 'replaces Number(s) with a string literal argument',
        code: dedent`
          const n = Number("3.14");
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const n = Result.unwrapOkOr(Num.safeParseFloat("3.14"), Number.NaN);
        `,
        errors: [{ messageId: 'useSafeParseFloat' }],
      },
      {
        name: 'replaces all three forms in one file',
        code: dedent`
          const s = "1.5";
          const a = parseFloat(s);
          const b = Number.parseFloat(s);
          const c = Number(s);
        `,
        output: dedent`
          import { Num, Result } from 'ts-data-forge';
          const s = "1.5";
          const a = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
          const b = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
          const c = Result.unwrapOkOr(Num.safeParseFloat(s), Number.NaN);
        `,
        errors: [
          { messageId: 'useSafeParseFloat' },
          { messageId: 'useSafeParseFloat' },
          { messageId: 'useSafeParseFloat' },
        ],
      },
    ],
  });
}, 20000);
