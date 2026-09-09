import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertDeepStrictEqual';

type Options = readonly [];

export const preferAssertDeepStrictEqualOverDeepEqualRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer assert.deepStrictEqual(X) over assert.deepEqual(X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertDeepStrictEqual:
        'Use assert.deepStrictEqual(X) instead of assert.deepEqual(X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    MemberExpression: (node) => {
      if (
        getVitestReceiver(context.sourceCode, node.object, 'assert') !==
          undefined &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        node.property.name === 'deepEqual' &&
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node
      ) {
        const { property } = node;

        context.report({
          node,
          messageId: 'preferAssertDeepStrictEqual',
          // Only the method name is rewritten, so the receiver keeps whatever
          // it is called here.
          fix: (fixer) => fixer.replaceText(property, 'deepStrictEqual'),
        });
      }
    },
  }),
} as const;
