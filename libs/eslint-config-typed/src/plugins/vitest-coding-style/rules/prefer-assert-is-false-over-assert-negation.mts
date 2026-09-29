import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { argumentText, withoutTypeWrappers } from './type-wrappers.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsFalseOverAssertNegation';

type Options = readonly [];

/**
 * `assert.isTrue(!X)` becomes `assert.isFalse(X)`. The callee, the receiver and
 * the argument are read through `as`, `satisfies`, `!` and `<T>`: a wrapper on
 * the receiver stays, and one around the negation goes with it
 * (`assert.isTrue(!x as boolean)` becomes `assert.isFalse(x)`).
 */
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
      const callee = withoutTypeWrappers(node.callee);

      if (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        getVitestReceiver(context.sourceCode, callee.object, 'assert') !==
          undefined &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        callee.property.name === 'isTrue' &&
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
            messageId: 'preferAssertIsFalseOverAssertNegation',
            // The method name and the negated argument are rewritten
            // separately, so the receiver keeps the name it has here. A
            // wrapper around the negation is dropped with it: it describes the
            // negation's type, not the operand's.
            fix: (fixer) => [
              fixer.replaceText(property, 'isFalse'),
              fixer.replaceText(arg, targetText),
            ],
          });
        }
      }
    },
  }),
} as const;
