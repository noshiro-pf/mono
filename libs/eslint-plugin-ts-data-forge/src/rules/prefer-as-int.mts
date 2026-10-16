import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getArgumentText,
  getImportDeclarations,
  getNamedImports,
} from 'eslint-rule-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { brandedNumberTypeNameToFunctionName } from './branded-number-types.mjs';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

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
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImports = getImportDeclarations(
      program,
      TS_DATA_FORGE_MODULE,
    );

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
        const namedImports = getNamedImports(tsDataForgeImports);

        // Group nodes by function name to handle imports efficiently
        const functionNameToNodes = Map.groupBy(
          mut_nodesToFix,
          (nodeInfo) => nodeInfo.functionName,
        );

        // Process each group
        for (const [functionName, nodes] of functionNameToNodes) {
          const hasImport = namedImports.includes(functionName);

          for (const [index, { node, typeName }] of nodes.entries()) {
            context.report({
              node,
              messageId: 'useBrandedNumberCastFunction',
              data: {
                typeName,
                functionName,
              },
              fix: (fixer) => {
                const replacement = `${functionName}(${getArgumentText(sourceCode, node.expression)})`;

                // Add import only for the first node of this function and only if not already imported
                const importFixes =
                  index === 0 && !hasImport
                    ? buildNamedImportFix(
                        fixer,
                        program,
                        TS_DATA_FORGE_MODULE,
                        [functionName],
                      )
                    : [];

                return [...importFixes, fixer.replaceText(node, replacement)];
              },
            });
          }
        }
      },
    };
  },
  defaultOptions: [],
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
