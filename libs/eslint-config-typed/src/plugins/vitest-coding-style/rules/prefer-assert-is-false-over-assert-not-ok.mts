import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { isCalleeOfCall } from './type-wrappers.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsFalseOverAssertNotOk';

type Options = readonly [];

/**
 * `assert.isNotOk(X)` and `assert.notOk(X)` become `assert.isFalse(X)`. The
 * receiver and the call are read through `as`, `satisfies`, `!` and `<T>`,
 * which the fix leaves in place.
 */
export const preferAssertIsFalseOverAssertNotOkRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isFalse(X) over assert.isNotOk(X), assert.notOk(X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsFalseOverAssertNotOk:
        'Use assert.isFalse(X) instead of assert.isNotOk(X), assert.notOk(X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    MemberExpression: (node) => {
      if (
        getVitestReceiver(context.sourceCode, node.object, 'assert') !==
          undefined &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        (node.property.name === 'isNotOk' || node.property.name === 'notOk') &&
        isCalleeOfCall(node)
      ) {
        const { property } = node;

        context.report({
          node,
          messageId: 'preferAssertIsFalseOverAssertNotOk',
          fix: (fixer) => fixer.replaceText(property, 'isFalse'),
        });
      }
    },
  }),
} as const;
