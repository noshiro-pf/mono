import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getImportDeclarations,
  getNamedImports,
} from '../imports.mjs';
import { getRangeWithParens } from '../parentheses.mjs';
import { isIdentifierNamed, skipTypeWrappers } from '../type-wrappers.mjs';

/**
 * Builds a rule that replaces `Array.isArray` with `<namespace>.isArray`
 * imported from `moduleName`. Only the callee is rewritten; the arguments stay
 * as written.
 */
export const createPreferArrayIsArray = ({
  moduleName,
  namespace,
}: Readonly<{
  /** The module that exports `namespace`. */
  moduleName: string;

  /** The exported namespace whose `isArray` replaces `Array.isArray`. */
  namespace: string;
}>): TSESLint.RuleModule<'useIsArray', readonly []> => {
  const replacement = `${namespace}.isArray` as const;

  const text =
    `Replace \`Array.isArray\` with \`${replacement}\` from ${moduleName}.` as const;

  return {
    meta: {
      type: 'suggestion',
      docs: { description: text },
      fixable: 'code',
      schema: [],
      messages: { useIsArray: text },
      defaultOptions: [],
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const moduleImports = getImportDeclarations(program, moduleName);

      const mut_nodesToFix: TSESTree.CallExpression[] = [];

      return {
        CallExpression: (node) => {
          if (!isArrayIsArrayCall(node)) {
            return;
          }

          mut_nodesToFix.push(node);
        },
        'Program:exit': () => {
          const hasNamespaceImport =
            getNamedImports(moduleImports).includes(namespace);

          // The import fix lives on the first report only:
          // `insertTextBefore(program, …)` produces overlapping ranges
          // otherwise and only one of them would survive a pass. A first
          // report silenced by an `eslint-disable` comment therefore takes
          // the import with it.
          for (const [index, node] of mut_nodesToFix.entries()) {
            context.report({
              node,
              messageId: 'useIsArray',
              fix: (fixer) => {
                const importFixes =
                  index === 0 && !hasNamespaceImport
                    ? buildNamedImportFix(fixer, program, moduleName, [
                        namespace,
                      ])
                    : ([] as const);

                // Only the callee is replaced, type wrappers included, along
                // with the parentheses around it, which its range leaves out;
                // the arguments stay as written.
                return [
                  ...importFixes,
                  fixer.replaceTextRange(
                    getRangeWithParens(sourceCode, node.callee),
                    replacement,
                  ),
                ];
              },
            });
          }
        },
      };
    },
  } as const;
};

/**
 * Whether `node` calls `Array.isArray`, the callee and `Array` both read
 * through their type wrappers: `(Array as ArrayConstructor).isArray(x)` and
 * `(Array.isArray as (u: unknown) => boolean)(x)` are the same call.
 */
const isArrayIsArrayCall = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): boolean => {
  const callee = skipTypeWrappers(node.callee);

  return (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    isIdentifierNamed(callee.object, 'Array') &&
    callee.property.type === AST_NODE_TYPES.Identifier &&
    callee.property.name === 'isArray'
  );
};
