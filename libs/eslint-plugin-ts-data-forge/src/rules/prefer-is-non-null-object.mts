import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers } from './ast-utils.mjs';
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

        if (identifierName === undefined) {
          return;
        }

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
} as const;

/**
 * The name of the value checked by `typeof u === 'object' && u !== null`, or
 * `undefined`. Every operand is read through type wrappers:
 * `(u satisfies unknown) !== null` and `u! !== null` check the same `u`.
 */
const getNonNullObjectIdentifierName = (
  // AST nodes hold mutable child arrays, so they are not deeply readonly.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.LogicalExpression,
): string | undefined => {
  if (node.operator !== '&&') {
    return undefined;
  }

  const leftIdentifierName = getTypeofObjectIdentifierName(node.left);

  const rightIdentifierName = getNonNullCheckIdentifierName(node.right);

  return leftIdentifierName === undefined ||
    rightIdentifierName === undefined ||
    leftIdentifierName !== rightIdentifierName
    ? undefined
    : leftIdentifierName;
};

const getTypeofObjectIdentifierName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): string | undefined => {
  if (node.type !== AST_NODE_TYPES.BinaryExpression) {
    return undefined;
  }

  if (node.operator !== '===') {
    return undefined;
  }

  const left = skipTypeWrappers(node.left);

  const right = skipTypeWrappers(node.right);

  if (
    left.type !== AST_NODE_TYPES.UnaryExpression ||
    left.operator !== 'typeof' ||
    right.type !== AST_NODE_TYPES.Literal ||
    right.value !== 'object'
  ) {
    return undefined;
  }

  const argument = skipTypeWrappers(left.argument);

  return argument.type === AST_NODE_TYPES.Identifier
    ? argument.name
    : undefined;
};

const getNonNullCheckIdentifierName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): string | undefined => {
  if (node.type !== AST_NODE_TYPES.BinaryExpression) {
    return undefined;
  }

  if (node.operator !== '!==') {
    return undefined;
  }

  const left = skipTypeWrappers(node.left);

  const right = skipTypeWrappers(node.right);

  return left.type !== AST_NODE_TYPES.Identifier ||
    right.type !== AST_NODE_TYPES.Literal ||
    right.value !== null
    ? undefined
    : left.name;
};
