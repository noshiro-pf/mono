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

type MessageIds = 'useArrIsArray';

export const preferArrIsArray: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `Array.isArray` with `Arr.isArray` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useArrIsArray:
        'Replace `Array.isArray` with `Arr.isArray` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const mut_nodesToFix: TSESTree.CallExpression[] = [];

    return {
      CallExpression: (node) => {
        if (!isArrayIsArrayCall(node)) return;

        mut_nodesToFix.push(node);
      },
      'Program:exit': () => {
        // Check if Arr is already imported
        const hasArrImport = getNamedImports(tsDataForgeImport).includes('Arr');

        // Note: We add import only for the first node to avoid conflicts when
        // multiple fixes try to insert at the same position. This means if the
        // first node is disabled via eslint-disable comment, no import will be
        // added.
        for (const [index, node] of mut_nodesToFix.entries()) {
          context.report({
            node,
            messageId: 'useArrIsArray',
            fix: (fixer) => {
              const callee = node.callee;

              if (callee.type !== AST_NODE_TYPES.MemberExpression) return [];

              const replacement = `Arr.isArray${sourceCode.getText(node).slice(sourceCode.getText(callee).length)}`;

              // Add import only for the first node and only if not already imported
              const importFixes =
                index === 0 && !hasArrImport
                  ? buildImportFixes(fixer, program, tsDataForgeImport, ['Arr'])
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

const isArrayIsArrayCall = (
  node: DeepReadonly<TSESTree.CallExpression>,
): boolean => {
  if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return false;

  const { object, property } = node.callee;

  if (object.type !== AST_NODE_TYPES.Identifier) return false;

  if (object.name !== 'Array') return false;

  if (property.type !== AST_NODE_TYPES.Identifier) return false;

  if (property.name !== 'isArray') return false;

  return true;
};
