import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
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

ruleTester.run('no-enums', noEnums, {
  valid: [],
  invalid: [
    {
      filename: 'file.ts',
      code: `
        enum ZeroOrOne {
          Zero = 0,
          One = 1,
        }
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.TSEnumDeclaration,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        enum ZeroOrOne {
          Zero,
          One,
        }
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.TSEnumDeclaration,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        enum AOrB {
          A = "A",
          B = "B",
        }
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.TSEnumDeclaration,
        },
      ],
    },
  ],
} as const);
