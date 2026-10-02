import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getRangeWithParens,
  isIdentifierNamed,
  skipTypeWrappers,
} from './ast-utils.mjs';
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
          if (!isArrayIsArrayCall(node)) {
            return;
          }

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
                const importFixes =
                  index === 0 && !hasSafeArrayImport
                    ? buildImportFixes(fixer, program, ['SafeArray'])
                    : [];

                // Only the callee is replaced, type wrappers included, along
                // with the parentheses around it, which its range leaves out;
                // the arguments stay as written.
                return [
                  ...importFixes,
                  fixer.replaceTextRange(
                    getRangeWithParens(sourceCode, node.callee),
                    'SafeArray.isArray',
                  ),
                ];
              },
            });
          }
        },
      };
    },
    defaultOptions: [],
  } as const;

const isArrayIsArrayCall = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): boolean => {
  const callee = skipTypeWrappers(node.callee);

  if (callee.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const { object, property } = callee;

  if (!isIdentifierNamed(object, 'Array')) {
    return false;
  }

  if (property.type !== AST_NODE_TYPES.Identifier) {
    return false;
  }

  if (property.name !== 'isArray') {
    return false;
  }

  return true;
};
