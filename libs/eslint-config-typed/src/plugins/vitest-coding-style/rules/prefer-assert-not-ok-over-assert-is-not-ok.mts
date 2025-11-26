import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'preferAssertOverAssertNotOk';

type Options = readonly [];

export const preferAssertNotOkOverAssertIsNotOkRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer assert.notOk(X) over assert.isNotOk(X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertOverAssertNotOk:
        'Use assert.notOk(X) instead of assert.isNotOk(X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    MemberExpression: (node) => {
      if (
        node.object.type === AST_NODE_TYPES.Identifier &&
        node.object.name === 'assert' &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        node.property.name === 'isNotOk' &&
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node
      ) {
        context.report({
          node,
          messageId: 'preferAssertOverAssertNotOk',
          fix: (fixer) => fixer.replaceText(node, 'assert.notOk'),
        });
      }
    },
  }),
};
