import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'removeSideEffectImport';

/**
 * `import 'ts-data-forge';` binds nothing and runs nothing: every export is a
 * pure value or function, and the package declares `sideEffects: false`, which
 * is a promise that evaluating it changes nothing observable. TypeScript keeps
 * a side-effect import in the emitted JavaScript — that is the one kind it
 * never elides — so what is left is a module loaded for no reason, and a
 * bundler that trusts the flag drops it anyway.
 *
 * The rule matches the bare specifier exactly; an import of some other module
 * is none of its business.
 */
export const noSideEffectImport: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Remove a side-effect-only \`import '${TS_DATA_FORGE_MODULE}';\`, which binds no name and, the package being \`sideEffects: false\`, does nothing.`,
    },
    fixable: 'code',
    schema: [],
    messages: {
      removeSideEffectImport: `\`import '${TS_DATA_FORGE_MODULE}';\` binds no name, and \`${TS_DATA_FORGE_MODULE}\` declares \`sideEffects: false\`, so loading it does nothing. Remove it, and import what you need by name.`,
    },
  },

  create: (context) => ({
    ImportDeclaration: (node) => {
      if (
        node.source.value !== TS_DATA_FORGE_MODULE ||
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
