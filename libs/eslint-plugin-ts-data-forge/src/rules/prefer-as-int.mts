import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { getArgumentText } from 'eslint-rule-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { brandedNumberTypeNameToFunctionName } from './branded-number-types.mjs';
import { tsDataForgeValueAtByName } from './import-binding.mjs';

type Options = readonly [];

type MessageIds = 'useBrandedNumberCastFunction';

export const preferAsInt: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace branded number type assertions (e.g., `as Int`) with corresponding functions (e.g., `asInt()`) from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useBrandedNumberCastFunction:
        'Replace `as {{typeName}}` with `{{functionName}}()` from ts-data-forge.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const mut_nodesToFix: {
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion;
      typeName: string;
      functionName: string;
    }[] = [];

    // `x as Int` and `<Int>x` are the same assertion.
    const collect = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion,
    ): void => {
      const typeInfo = getBrandedNumberTypeInfo(node.typeAnnotation);

      if (typeInfo === undefined) {
        return;
      }

      mut_nodesToFix.push({
        node,
        typeName: typeInfo.typeName,
        functionName: typeInfo.functionName,
      });
    };

    return {
      TSAsExpression: collect,
      TSTypeAssertion: collect,
      'Program:exit': () => {
        // One binding per cast function, however many casts use it.
        const castAt = tsDataForgeValueAtByName(sourceCode);

        for (const { node, typeName, functionName } of mut_nodesToFix) {
          const cast = castAt(functionName)(node);

          context.report({
            node,
            messageId: 'useBrandedNumberCastFunction',
            data: {
              typeName,
              // The name the fix writes: an aliased import's local name.
              functionName: cast?.localName ?? functionName,
            },
            fix:
              cast === undefined
                ? null
                : (fixer) => [
                    ...cast.edits(fixer),
                    fixer.replaceText(
                      node,
                      `${cast.localName}(${getArgumentText(sourceCode, node.expression)})`,
                    ),
                  ],
          });
        }
      },
    };
  },
} as const;

const getBrandedNumberTypeInfo = (
  typeAnnotation: DeepReadonly<TSESTree.TypeNode>,
): Readonly<{ typeName: string; functionName: string }> | undefined => {
  if (typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
    return undefined;
  }

  if (typeAnnotation.typeName.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const typeName = typeAnnotation.typeName.name;

  if (!brandedNumberTypeNameToFunctionName.has(typeName)) {
    return undefined;
  }

  const functionName = brandedNumberTypeNameToFunctionName.get(typeName);

  return functionName === undefined ? undefined : { typeName, functionName };
};
