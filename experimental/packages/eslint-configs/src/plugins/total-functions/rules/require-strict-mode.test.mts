import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { requireStrictMode } from './require-strict-mode.mjs';

const ruleTesterForTSConfig = (config: string): RuleTester =>
  new RuleTester({
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        project: config,
        // EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
      },
      parser,
    },
  });

const strictRuleTester = ruleTesterForTSConfig('./tsconfig.tests.json');

strictRuleTester.run('require-strict-mode', requireStrictMode, {
  valid: [
    {
      filename: 'file.ts',
      code: '// strictRuleTester',
    },
  ],
  invalid: [],
} as const);

const nonStrictRuleTester = ruleTesterForTSConfig(
  './tsconfig.tests.non-strict.json',
);

nonStrictRuleTester.run('require-strict-mode', requireStrictMode, {
  valid: [],
  invalid: [
    {
      filename: 'file.ts',
      code: '// nonStrictRuleTester',
      errors: [
        {
          messageId: 'strict',
          type: AST_NODE_TYPES.Program,
        },
      ],
    },
  ],
} as const);

const nonNoUncheckedIndexedAccessRuleTester = ruleTesterForTSConfig(
  './tsconfig.tests.non-noUncheckedIndexedAccess.json',
);

nonNoUncheckedIndexedAccessRuleTester.run(
  'require-strict-mode',
  requireStrictMode,
  {
    valid: [],
    invalid: [
      {
        filename: 'file.ts',
        code: '// nonNoUncheckedIndexedAccessRuleTester',
        errors: [
          {
            messageId: 'noUncheckedIndexedAccess',
            type: AST_NODE_TYPES.Program,
          },
        ],
      },
    ],
  } as const,
);

const strictFunctionTypesRuleTester = ruleTesterForTSConfig(
  './tsconfig.tests.non-strictFunctionTypes.json',
);

strictFunctionTypesRuleTester.run('require-strict-mode', requireStrictMode, {
  valid: [],
  invalid: [
    {
      filename: 'file.ts',
      code: '// strictFunctionTypesRuleTester',
      errors: [
        {
          messageId: 'strictFunctionTypes',
          type: AST_NODE_TYPES.Program,
        },
      ],
    },
  ],
} as const);
