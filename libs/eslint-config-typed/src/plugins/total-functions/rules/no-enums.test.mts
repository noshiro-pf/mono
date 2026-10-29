import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noEnums } from './no-enums.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

ruleTester.run<'errorStringGeneric', readonly []>('no-enums', noEnums, {
  valid: [],
  invalid: [
    {
      filename: 'file.ts',
      code: dedent`
        enum ZeroOrOne {
          Zero = 0,
          One = 1,
        }
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        enum ZeroOrOne {
          Zero,
          One,
        }
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        enum AOrB {
          A = "A",
          B = "B",
        }
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
  ],
} as const);
