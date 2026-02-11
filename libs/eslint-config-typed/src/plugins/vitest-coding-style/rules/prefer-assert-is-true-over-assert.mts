import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'preferAssertIsTrueOverAssert';

type Options = readonly [];

export const preferAssertIsTrueOverAssertRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isTrue(X) over assert(X), assert.isOk(X), assert.ok(X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsTrueOverAssert:
        'Use assert.isTrue(X) instead of {{method}}(X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression: (node) => {
      // assert(X) -> assert.isTrue(X)
      if (
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'assert'
      ) {
        if (node.arguments.length === 0) {
          return;
        }

        context.report({
          node: node.callee,
          messageId: 'preferAssertIsTrueOverAssert',
          data: { method: 'assert' },
          fix: (fixer) => fixer.replaceText(node.callee, 'assert.isTrue'),
        });

        return;
      }

      // assert.isOk(X) -> assert.isTrue(X)

      if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
        const callee = node.callee;

        if (
          callee.object.type === AST_NODE_TYPES.Identifier &&
          callee.object.name === 'assert' &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          (callee.property.name === 'isOk' || callee.property.name === 'ok')
        ) {
          context.report({
            node: callee,
            messageId: 'preferAssertIsTrueOverAssert',
            data: { method: `assert.${callee.property.name}` },
            fix: (fixer) => fixer.replaceText(callee, 'assert.isTrue'),
          });
        }
      }
    },
  }),
} as const;
