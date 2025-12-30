import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useIsNonNullObject';

export const preferIsNonNullObject: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `typeof u === "object" && u !== null` with `isNonNullObject(u)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsNonNullObject:
        'Replace the object/null check with `isNonNullObject()` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const mut_nodesToFix: {
      node: TSESTree.LogicalExpression;
      identifierName: string;
    }[] = [];

    return {
      LogicalExpression: (node) => {
        const identifierName = getNonNullObjectIdentifierName(node);

        if (identifierName === undefined) return;

        mut_nodesToFix.push({ node, identifierName });
      },
      'Program:exit': () => {
        // Check if isNonNullObject is already imported
        const hasIsNonNullObjectImport =
          getNamedImports(tsDataForgeImport).includes('isNonNullObject');

        // Note: We add import only for the first node to avoid conflicts when
        // multiple fixes try to insert at the same position. This means if the
        // first node is disabled via eslint-disable comment, no import will be
        // added.
        for (const [
          index,
          { node, identifierName },
        ] of mut_nodesToFix.entries()) {
          context.report({
            node,
            messageId: 'useIsNonNullObject',
            fix: (fixer) => {
              const replacement = `isNonNullObject(${identifierName})`;

              // Add import only for the first node and only if not already imported
              const importFixes =
                index === 0 && !hasIsNonNullObjectImport
                  ? buildImportFixes(fixer, program, tsDataForgeImport, [
                      'isNonNullObject',
                    ])
                  : [];

              return [...importFixes, fixer.replaceText(node, replacement)];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
};

const getNonNullObjectIdentifierName = (
  node: DeepReadonly<TSESTree.LogicalExpression>,
): string | undefined => {
  if (node.operator !== '&&') return undefined;

  const leftIdentifierName = getTypeofObjectIdentifierName(node.left);

  const rightIdentifierName = getNonNullCheckIdentifierName(node.right);

  if (leftIdentifierName === undefined) return undefined;

  if (rightIdentifierName === undefined) return undefined;

  if (leftIdentifierName !== rightIdentifierName) return undefined;

  return leftIdentifierName;
};

const getTypeofObjectIdentifierName = (
  node: DeepReadonly<TSESTree.Expression>,
): string | undefined => {
  if (node.type !== AST_NODE_TYPES.BinaryExpression) return undefined;

  if (node.operator !== '===') return undefined;

  const { left, right } = node;

  if (left.type !== AST_NODE_TYPES.UnaryExpression) return undefined;

  if (left.operator !== 'typeof') return undefined;

  if (right.type !== AST_NODE_TYPES.Literal) return undefined;

  if (right.value !== 'object') return undefined;

  if (left.argument.type !== AST_NODE_TYPES.Identifier) return undefined;

  return left.argument.name;
};

const getNonNullCheckIdentifierName = (
  node: DeepReadonly<TSESTree.Expression>,
): string | undefined => {
  if (node.type !== AST_NODE_TYPES.BinaryExpression) return undefined;

  if (node.operator !== '!==') return undefined;

  const { left, right } = node;

  if (left.type !== AST_NODE_TYPES.Identifier) return undefined;

  if (right.type !== AST_NODE_TYPES.Literal) return undefined;

  if (right.value !== null) return undefined;

  return left.name;
};
