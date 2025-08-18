import { ESLintUtils } from '@typescript-eslint/utils';
import { isThenableType } from 'tsutils';
import { createRule, typeSymbolName } from './common.mjs';
import { effects, fpTsEffectType } from './fp-ts.mjs';

/** An ESLint rule to ban problematic nested fp-ts effects. */

export const noNestedFpTsEffects = createRule({
  name: 'no-nested-fp-ts-effects',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans problematic nested fp-ts effects.',
    },
    messages: {
      errorStringGeneric: 'Do not nest these fp-ts effects.',
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression: (node) => {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const expressionType = checker.getTypeAtLocation(tsNode);

        const effectType = fpTsEffectType(expressionType);

        if (effectType === undefined) {
          return;
        }

        // TODO report other types of problematic nesting besides Tasks within IOs.

        if (
          effectType.effectName === 'IO' &&
          effectType.effectTypeParameter !== undefined
        ) {
          const effectTypeParameterName = typeSymbolName(
            effectType.effectTypeParameter,
          );

          if (effectTypeParameterName === undefined) {
            return;
          }
          const isNestedEffect = effects.includes(effectTypeParameterName);

          const isNestedPromise = isThenableType(
            checker,
            tsNode,
            effectType.effectTypeParameter,
          );

          if (isNestedEffect || isNestedPromise) {
            context.report({
              node,
              messageId: 'errorStringGeneric',
            } as const);
          }
        }
      },
    };
  },
  defaultOptions: [],
} as const);
