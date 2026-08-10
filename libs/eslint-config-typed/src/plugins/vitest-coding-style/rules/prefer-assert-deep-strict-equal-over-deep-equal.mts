import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

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
        node.object.type === AST_NODE_TYPES.Identifier &&
        node.object.name === 'assert' &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        node.property.name === 'deepEqual' &&
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node
      ) {
        context.report({
          node,
          messageId: 'preferAssertDeepStrictEqual',
          fix: (fixer) => fixer.replaceText(node, 'assert.deepStrictEqual'),
        });
      }
    },
  }),
} as const;
