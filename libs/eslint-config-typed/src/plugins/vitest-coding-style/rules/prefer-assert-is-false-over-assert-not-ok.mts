import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'preferAssertIsFalseOverAssertNotOk';

type Options = readonly [];

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
        node.object.type === AST_NODE_TYPES.Identifier &&
        node.object.name === 'assert' &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        (node.property.name === 'isNotOk' || node.property.name === 'notOk') &&
        node.parent.type === AST_NODE_TYPES.CallExpression &&
        node.parent.callee === node
      ) {
        context.report({
          node,
          messageId: 'preferAssertIsFalseOverAssertNotOk',
          fix: (fixer) => fixer.replaceText(node, 'assert.isFalse'),
        });
      }
    },
  }),
};
