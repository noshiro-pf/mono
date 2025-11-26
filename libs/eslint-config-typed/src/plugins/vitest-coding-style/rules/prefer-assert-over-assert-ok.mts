import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'preferAssertOverAssertOk';

type Options = readonly [];

export const preferAssertOverAssertOkRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer assert(X) over assert.ok(X), assert.isOk(X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertOverAssertOk:
        'Use assert(X) instead of assert.ok(X), assert.isOk(X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    MemberExpression: (node) => {
      if (
        node.object.type === AST_NODE_TYPES.Identifier &&
        node.object.name === 'assert' &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        (node.property.name === 'ok' || node.property.name === 'isOk') &&
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node
      ) {
        context.report({
          node,
          messageId: 'preferAssertOverAssertOk',
          fix: (fixer) => fixer.replaceText(node, 'assert'),
        });
      }
    },
  }),
};
