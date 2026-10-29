import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

/**
 * Builds a rule that removes `import '<moduleName>';`, an import that binds no
 * name. The rule matches the bare specifier exactly, so a subpath such as
 * `<moduleName>/global` and every other module are left alone.
 *
 * Why such an import is wrong depends on the module — one with
 * `sideEffects: false` loads for nothing, one with no runtime entry point fails
 * to resolve — so the caller says it, in `description` and `message`, and
 * chooses `type` accordingly.
 */
export const createNoSideEffectImport = ({
  moduleName,
  type,
  description,
  message,
}: Readonly<{
  moduleName: string;
  type: TSESLint.RuleMetaData<string, unknown>['type'];
  description: string;
  message: string;
}>): TSESLint.RuleModule<'removeSideEffectImport', readonly []> =>
  ({
    meta: {
      type,
      docs: { description },
      fixable: 'code',
      schema: [],
      messages: { removeSideEffectImport: message },
      defaultOptions: [],
    },

    create: (context) => ({
      ImportDeclaration: (node) => {
        if (node.source.value !== moduleName || node.specifiers.length > 0) {
          return;
        }

        context.report({
          node,
          messageId: 'removeSideEffectImport',
          fix: (fixer) => removeStatement(fixer, context.sourceCode, node),
        });
      },
    }),
  }) as const;

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Removes a statement along with the rest of its line, so that deleting it does
 * not leave a blank line where it was.
 */
const removeStatement = (
  fixer: TSESLint.RuleFixer,
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
): TSESLint.RuleFix => {
  const restOfLine = /^[^\S\n]*\n/u.exec(
    sourceCode.getText().slice(node.range[1]),
  );

  return fixer.removeRange([
    node.range[0],
    node.range[1] + (restOfLine?.[0].length ?? 0),
  ]);
};
