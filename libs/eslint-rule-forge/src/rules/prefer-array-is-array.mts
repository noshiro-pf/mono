import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { bindValueImportsAt } from '../imports.mjs';
import { getRangeWithParens } from '../parentheses.mjs';
import { isIdentifierNamed, skipTypeWrappers } from '../type-wrappers.mjs';
import { builtBy } from './rule-factory.mjs';

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
}>): TSESLint.RuleModule<'useIsArray', readonly []> =>
  builtBy(createPreferArrayIsArray, {
    meta: {
      type: 'suggestion',
      docs: {
        description: `Replace \`Array.isArray\` with \`${namespace}.isArray\` from ${moduleName}.`,
      },
      fixable: 'code',
      schema: [],
      messages: {
        useIsArray: `Replace \`Array.isArray\` with \`{{replacement}}\` from ${moduleName}.`,
      },
      defaultOptions: [],
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const mut_nodesToFix: TSESTree.CallExpression[] = [];

      return {
        CallExpression: (node) => {
          if (!isArrayIsArrayCall(node)) {
            return;
          }

          mut_nodesToFix.push(node);
        },
        'Program:exit': () => {
          if (mut_nodesToFix.length === 0) {
            return;
          }

          const bindingAt = bindValueImportsAt(sourceCode, moduleName, [
            namespace,
          ]);

          // Every fix brings the namespace into scope itself, so that one
          // applied alone (an editor's quick fix) is complete.
          for (const node of mut_nodesToFix) {
            const binding = bindingAt(node);

            const localName = binding?.localNames[0];

            context.report({
              node,
              messageId: 'useIsArray',
              data: {
                // The name the fix writes; with no fix, the export's own.
                replacement: `${localName ?? namespace}.isArray`,
              },
              fix:
                binding === undefined || localName === undefined
                  ? null
                  : (fixer) => [
                      ...binding.edits(fixer),
                      // Only the callee is replaced, type wrappers included,
                      // along with the parentheses around it, which its range
                      // leaves out; the arguments stay as written.
                      fixer.replaceTextRange(
                        getRangeWithParens(sourceCode, node.callee),
                        `${localName}.isArray`,
                      ),
                    ],
            });
          }
        },
      };
    },
  });

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
