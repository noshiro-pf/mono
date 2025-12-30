import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { brandedNumberTypeNameToFunctionName } from './branded-number-types.mjs';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

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

    const tsDataForgeImport = getTsDataForgeImport(program);

    const mut_nodesToFix: {
      node: TSESTree.TSAsExpression;
      typeName: string;
      functionName: string;
    }[] = [];

    return {
      TSAsExpression: (node) => {
        const typeInfo = getBrandedNumberTypeInfo(node.typeAnnotation);

        if (typeInfo === undefined) return;

        mut_nodesToFix.push({
          node,
          typeName: typeInfo.typeName,
          functionName: typeInfo.functionName,
        });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImport);

        // Group nodes by function name to handle imports efficiently
        const mut_functionNameToNodes = new Map<
          string,
          Readonly<{
            node: TSESTree.TSAsExpression;
            typeName: string;
            functionName: string;
          }>[]
        >();

        for (const nodeInfo of mut_nodesToFix) {
          const mut_nodes =
            mut_functionNameToNodes.get(nodeInfo.functionName) ?? [];

          mut_nodes.push(nodeInfo);

          mut_functionNameToNodes.set(nodeInfo.functionName, mut_nodes);
        }

        // Process each group
        for (const [functionName, nodes] of mut_functionNameToNodes) {
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
                const replacement = `${functionName}(${sourceCode.getText(node.expression)})`;

                // Add import only for the first node of this function and only if not already imported
                const importFixes =
                  index === 0 && !hasImport
                    ? buildImportFixes(fixer, program, tsDataForgeImport, [
                        functionName,
                      ])
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
};

const getBrandedNumberTypeInfo = (
  typeAnnotation: DeepReadonly<TSESTree.TypeNode>,
): Readonly<{ typeName: string; functionName: string }> | undefined => {
  if (typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) return undefined;

  if (typeAnnotation.typeName.type !== AST_NODE_TYPES.Identifier)
    return undefined;

  const typeName = typeAnnotation.typeName.name;

  if (!brandedNumberTypeNameToFunctionName.has(typeName)) return undefined;

  const functionName = brandedNumberTypeNameToFunctionName.get(typeName);

  if (functionName === undefined) return undefined;

  return { typeName, functionName };
};
