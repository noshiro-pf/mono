import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'removeSideEffectImport';

/**
 * `import 'ts-type-forge';` binds nothing, and there is nothing for it to run:
 * the package ships declarations only, and its `exports` map offers no runtime
 * condition at all, so the import fails to resolve the moment the module graph
 * is loaded. TypeScript keeps a side-effect import in the emitted JavaScript —
 * that is the one kind it never elides — so this is a runtime error waiting in
 * a file that type-checks.
 *
 * The ambient globals are a separate entry point, `ts-type-forge/global`,
 * usually brought in through `compilerOptions.types` or a triple-slash
 * reference. This rule matches the bare specifier exactly, so that subpath is
 * left alone.
 */
export const noSideEffectImport: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description: `Remove a side-effect-only \`import '${TS_TYPE_FORGE_MODULE}';\`, which binds no name and has no runtime entry point to resolve to. \`${TS_TYPE_FORGE_MODULE}/global\` is left alone.`,
    },
    fixable: 'code',
    schema: [],
    messages: {
      removeSideEffectImport: `\`import '${TS_TYPE_FORGE_MODULE}';\` binds no name, and \`${TS_TYPE_FORGE_MODULE}\` ships types only — it has no runtime entry point, so the import throws when the module is loaded. Remove it; the ambient globals come from \`${TS_TYPE_FORGE_MODULE}/global\`, not from this.`,
    },
  },

  create: (context) => ({
    ImportDeclaration: (node) => {
      if (
        node.source.value !== TS_TYPE_FORGE_MODULE ||
        !Arr.isEmpty(node.specifiers)
      ) {
        return;
      }

      context.report({
        node,
        messageId: 'removeSideEffectImport',
        fix: (fixer) => removeStatement(fixer, context.sourceCode, node),
      });
    },
  }),
  defaultOptions: [],
} as const;

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
