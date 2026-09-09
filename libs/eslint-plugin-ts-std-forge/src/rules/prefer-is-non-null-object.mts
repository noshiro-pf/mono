import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import {
  buildImportFixes,
  getNamedImports,
  getTsStdForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useIsNonNullObject';

export const preferIsNonNullObject: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `typeof u === "object" && u !== null` with `isNonNullObject(u)` from ts-std-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsNonNullObject:
        'Replace the object/null check with `isNonNullObject()` from ts-std-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsStdForgeImport = getTsStdForgeImport(program);

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
        const hasIsNonNullObjectImport =
          getNamedImports(tsStdForgeImport).includes('isNonNullObject');

        // The import fix lives on the first report only:
        // `insertTextBefore(program, …)` produces overlapping ranges
        // otherwise and only one of them would survive a pass. A first report
        // silenced by an `eslint-disable` comment therefore takes the import
        // with it.
        for (const [
          index,
          { node, identifierName },
        ] of mut_nodesToFix.entries()) {
          context.report({
            node,
            messageId: 'useIsNonNullObject',
            fix: (fixer) => {
              const replacement = `isNonNullObject(${identifierName})`;

              const importFixes =
                index === 0 && !hasIsNonNullObjectImport
                  ? buildImportFixes(fixer, program, ['isNonNullObject'])
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
