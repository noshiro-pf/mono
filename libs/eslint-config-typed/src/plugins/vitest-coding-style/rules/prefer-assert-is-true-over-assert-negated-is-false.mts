import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';

type MessageIds = 'preferAssertIsTrueOverNegatedAssertIsFalse';

type Options = readonly [];

export const preferAssertIsTrueOverNegatedAssertIsFalseRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer assert.isTrue(X) over assert.isFalse(!X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsTrueOverNegatedAssertIsFalse:
        'Use assert.isTrue(X) instead of assert.isFalse(!X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression: (node) => {
      if (
        node.callee.type === AST_NODE_TYPES.MemberExpression &&
        node.callee.object.type === AST_NODE_TYPES.Identifier &&
        node.callee.object.name === 'assert' &&
        node.callee.property.type === AST_NODE_TYPES.Identifier &&
        node.callee.property.name === 'isFalse' &&
        Arr.isArrayOfLength(node.arguments, 1)
      ) {
        const [arg] = node.arguments;

        if (
          arg.type === AST_NODE_TYPES.UnaryExpression &&
          arg.operator === '!'
        ) {
          const targetText = context.sourceCode.getText(arg.argument);

          context.report({
            node: arg,
            messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse',
            fix: (fixer) =>
              fixer.replaceText(node, `assert.isTrue(${targetText})`),
          });
        }
      }
    },
  }),
};
