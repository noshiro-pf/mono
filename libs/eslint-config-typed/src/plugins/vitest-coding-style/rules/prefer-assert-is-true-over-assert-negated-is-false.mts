import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { getVitestReceiver } from './vitest-binding.mjs';

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
        getVitestReceiver(context.sourceCode, node.callee.object, 'assert') !==
          undefined &&
        node.callee.property.type === AST_NODE_TYPES.Identifier &&
        node.callee.property.name === 'isFalse' &&
        Arr.isFixedLengthTuple(1, node.arguments)
      ) {
        const { property } = node.callee;

        const [arg] = node.arguments;

        if (
          arg.type === AST_NODE_TYPES.UnaryExpression &&
          arg.operator === '!'
        ) {
          const targetText = context.sourceCode.getText(arg.argument);

          context.report({
            node: arg,
            messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse',
            // The method name and the negated argument are rewritten
            // separately, so the receiver keeps the name it has here.
            fix: (fixer) => [
              fixer.replaceText(property, 'isTrue'),
              fixer.replaceText(arg, targetText),
            ],
          });
        }
      }
    },
  }),
} as const;
