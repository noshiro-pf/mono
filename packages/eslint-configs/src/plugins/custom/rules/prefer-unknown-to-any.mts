import { type TSESLint } from '@typescript-eslint/utils';
import { createRule } from './common.mjs';

/** An ESLint rule to ban `any` type. */

export type MessageIds = 'unexpectedAny';

export const preferUnknownToAny = createRule({
  name: 'prefer-unknown-to-any',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the `any` type',
      recommended: 'recommended',
    },
    fixable: 'code',
    hasSuggestions: false,
    messages: {
      unexpectedAny: 'Use unknown instead of any.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAnyKeyword(node): void {
        context.report({
          node,
          messageId: 'unexpectedAny',
          fix: (fixer): TSESLint.RuleFix => fixer.replaceText(node, 'unknown'),
        });
      },
    };
  },
} as const);
