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
