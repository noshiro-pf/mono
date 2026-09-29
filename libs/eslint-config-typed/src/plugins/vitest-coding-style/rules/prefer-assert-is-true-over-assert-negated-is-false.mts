import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { argumentText, withoutTypeWrappers } from './type-wrappers.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsTrueOverNegatedAssertIsFalse';

type Options = readonly [];

/**
 * `assert.isFalse(!X)` becomes `assert.isTrue(X)`. The callee, the receiver and
 * the argument are read through `as`, `satisfies`, `!` and `<T>`: a wrapper on
 * the receiver stays, and one around the negation goes with it
 * (`assert.isFalse(!x as boolean)` becomes `assert.isTrue(x)`).
 */
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
      const callee = withoutTypeWrappers(node.callee);

      if (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        getVitestReceiver(context.sourceCode, callee.object, 'assert') !==
          undefined &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        callee.property.name === 'isFalse' &&
        Arr.isFixedLengthTuple(1, node.arguments)
      ) {
        const { property } = callee;

        const [arg] = node.arguments;

        const negation =
          arg.type === AST_NODE_TYPES.SpreadElement
            ? arg
            : withoutTypeWrappers(arg);

        if (
          negation.type === AST_NODE_TYPES.UnaryExpression &&
          negation.operator === '!'
        ) {
          const targetText = argumentText(
            context.sourceCode.text,
            negation.argument,
          );

          context.report({
            node: arg,
            messageId: 'preferAssertIsTrueOverNegatedAssertIsFalse',
            // The method name and the negated argument are rewritten
            // separately, so the receiver keeps the name it has here. A
            // wrapper around the negation is dropped with it: it describes the
            // negation's type, not the operand's.
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
