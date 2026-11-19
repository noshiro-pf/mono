import { ESLintUtils } from '@typescript-eslint/utils';
import { typeHoldsAtSomeLayer } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import { createRule } from './common.mjs';
import { fpTsEffectType } from './fp-ts.mjs';

/**
 * An ESLint rule to ban interpretation (execution) of fp-ts effects.
 *
 * The callee is read through `as`, `satisfies`, `!` and `<T>`, and is an effect
 * if the type at any wrapper layer says so.
 */

export const noPrematureFpTsEffects = createRule({
  name: 'no-premature-fp-ts-effects',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans interpretation (execution) of fp-ts effects.',
    },
    messages: {
      errorStringGeneric:
        "Ensure you aren't interpreting this fp-ts effect until the very end of your program.",
    },
    schema: [],
    defaultOptions: [],
  },
  create: (context) => {
    // Throws without type information, which the rule needs.
    ESLintUtils.getParserServices(context);

    return {
      CallExpression: (node) => {
        if (Arr.isNonEmpty(node.arguments)) {
          return;
        }

        // `(effect as () => void)()` still runs the effect, so the callee is an
        // effect if the type at any wrapper layer says so.
        const isEffect = typeHoldsAtSomeLayer(
          context.sourceCode,
          node.callee,
          (type) => fpTsEffectType(type) !== undefined,
        );

        if (!isEffect) {
          return;
        }

        // TODO: don't flag error if we can confirm we are at the program entrypoint.

        context.report({
          node,
          messageId: 'errorStringGeneric',
        } as const);
      },
    };
  },
} as const);
