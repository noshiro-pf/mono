import { type TSESLint } from '@typescript-eslint/utils';
import { createRule } from './common.mjs';

/** An ESLint rule to ban mutable types. */

export type MessageIds = 'unexpectedMutableType';

export const preferDeepReadonlyType = createRule({
  name: 'prefer-deep-readonly-type',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow mutable types',
      recommended: 'recommended',
    },
    fixable: 'code',
    hasSuggestions: false,
    messages: {
      unexpectedAny: 'Use readonly, Readonly, or DeepReadonly type.',
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
