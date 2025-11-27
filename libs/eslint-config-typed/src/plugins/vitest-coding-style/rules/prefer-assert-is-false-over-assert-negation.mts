import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';

type MessageIds = 'preferAssertIsFalseOverAssertNegation';

type Options = readonly [];

export const preferAssertIsFalseOverNegatedAssertIsTrueRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer assert.isFalse(X) over assert.isTrue(!X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsFalseOverAssertNegation:
        'Use assert.isFalse(X) instead of assert.isTrue(!X).',
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
        node.callee.property.name === 'isTrue' &&
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
            messageId: 'preferAssertIsFalseOverAssertNegation',
            fix: (fixer) =>
              fixer.replaceText(node, `assert.isFalse(${targetText})`),
          });
        }
      }
    },
  }),
};
