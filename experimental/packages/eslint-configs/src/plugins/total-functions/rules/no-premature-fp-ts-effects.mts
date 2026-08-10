import { ESLintUtils } from '@typescript-eslint/utils';
import { createRule } from './common.mjs';
import { fpTsEffectType } from './fp-ts.mjs';

/** An ESLint rule to ban interpretation (execution) of fp-ts effects. */

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
        if (node.arguments.length > 0) {
          return;
        }

        const calleeNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.callee,
        );
        const calleeType = checker.getTypeAtLocation(calleeNode);

        const effectType = fpTsEffectType(calleeType);

        if (effectType === undefined) {
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
