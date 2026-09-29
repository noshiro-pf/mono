import { ESLintUtils } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { createRule } from './common.mjs';
import { fpTsEffectType } from './fp-ts.mjs';
import { typeWrapperLayers } from './type-wrapper-layers.mjs';

/**
 * An ESLint rule to ban interpretation (execution) of fp-ts effects.
 *
 * The callee is read through `as`, `satisfies`, `!` and `<T>`, and is an
 * effect if the type at any wrapper layer says so.
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
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression: (node) => {
        if (Arr.isNonEmpty(node.arguments)) {
          return;
        }

        // `(effect as () => void)()` still runs the effect, so the callee is
        // an effect if the type at any wrapper layer says so.
        const isEffect = typeWrapperLayers(node.callee).some(
          (layer) =>
            fpTsEffectType(
              checker.getTypeAtLocation(
                parserServices.esTreeNodeToTSNodeMap.get(layer),
              ),
            ) !== undefined,
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
  defaultOptions: [],
} as const);
