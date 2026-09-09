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

type MessageIds = 'useSafeArrayIsArray';

export const preferSafeArrayIsArray: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Replace `Array.isArray` with `SafeArray.isArray` from ts-std-forge.',
      },
      fixable: 'code',
      schema: [],
      messages: {
        useSafeArrayIsArray:
          'Replace `Array.isArray` with `SafeArray.isArray` from ts-std-forge.',
      },
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const tsStdForgeImport = getTsStdForgeImport(program);

      const mut_nodesToFix: TSESTree.CallExpression[] = [];

      return {
        CallExpression: (node) => {
          if (!isArrayIsArrayCall(node)) return;

          mut_nodesToFix.push(node);
        },
        'Program:exit': () => {
          const hasSafeArrayImport =
            getNamedImports(tsStdForgeImport).includes('SafeArray');

          // The import fix lives on the first report only:
          // `insertTextBefore(program, …)` produces overlapping ranges
          // otherwise and only one of them would survive a pass. A first
          // report silenced by an `eslint-disable` comment therefore takes
          // the import with it.
          for (const [index, node] of mut_nodesToFix.entries()) {
            context.report({
              node,
              messageId: 'useSafeArrayIsArray',
              fix: (fixer) => {
                const callee = node.callee;

                if (callee.type !== AST_NODE_TYPES.MemberExpression) return [];

                const replacement = `SafeArray.isArray${sourceCode.getText(node).slice(sourceCode.getText(callee).length)}`;

                const importFixes =
                  index === 0 && !hasSafeArrayImport
                    ? buildImportFixes(fixer, program, ['SafeArray'])
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
