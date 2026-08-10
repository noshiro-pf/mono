import { ESLintUtils } from '@typescript-eslint/utils';
import { createRule } from './common.mjs';

/** An ESLint rule to enforce TypeScript strict mode. */

export const requireStrictMode = createRule({
  name: 'require-strict-mode',
  meta: {
    type: 'problem',
    docs: {
      description: "Enforces the use of TypeScript's strict mode.",
    },
    messages: {
      strict: "TypeScript's strict mode is required.",
      noUncheckedIndexedAccess:
        "TypeScript's noUncheckedIndexedAccess mode is required.",
      useUnknownInCatchVariables:
        'Do not disable the useUnknownInCatchVariables compiler option.',
      strictFunctionTypes:
        'Do not disable the strictFunctionTypes compiler option.',
      strictBindCallApply:
        'Do not disable the strictBindCallApply compiler option.',
      strictNullChecks: 'Do not disable the strictNullChecks compiler option.',
      strictPropertyInitialization:
        'Do not disable the strictPropertyInitialization compiler option.',
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const options = parserServices.program.getCompilerOptions();

    return {
      Program: (node) => {
        const mustBeEnabled = ['strict', 'noUncheckedIndexedAccess'] as const;
        const mustNotBeDisabled = [
          'strictFunctionTypes',
          'strictBindCallApply',
          'strictNullChecks',
          'strictPropertyInitialization',
          'useUnknownInCatchVariables',
        ] as const;

        for (const option of mustBeEnabled) {
          if (options[option] !== true) {
            context.report({
              node,
              messageId: option,
            } as const);
          }
        }

        for (const option of mustNotBeDisabled) {
          if (options[option] === false) {
            context.report({
              node,
              messageId: option,
            } as const);
          }
        }
      },
    };
  },
  defaultOptions: [],
} as const);
