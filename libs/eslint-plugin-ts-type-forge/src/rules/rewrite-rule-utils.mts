import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { resolveTypeName, type ImportStyle } from './import-style.mjs';
import { buildTypeImportFix } from './import-utils.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/** One deterministic replacement of a type node by a named ts-type-forge type. */
export type TypeRewrite = Readonly<{
  node: TSESTree.Node;
  canonicalName: string;
  /** Text inside the `<...>` of the replacement, e.g. `'2, string'`. */
  typeArgs: string;
}>;

/**
 * Emits one report per rewrite, resolving each target name. Every fix imports
 * the name it writes when the file does not import it yet
 * ({@link buildTypeImportFix}), so that one applied alone is complete, and the
 * first of those imports every name the reports need: the import edits
 * overlap, so `--fix` applies one fix per pass, and when that is the batching
 * fix the second pass applies the rest. (With nested rewrites an inner fix,
 * whose range ends first, can win the pass instead; that costs a pass, not a
 * fix.) A report that needs no import has no import edit.
 */
export const reportTypeRewrites = <MessageIds extends string>(
  context: TSESLint.RuleContext<MessageIds, readonly unknown[]>,
  rewrites: readonly TypeRewrite[],
  messageId: MessageIds,
  importStyle: ImportStyle,
): void => {
  const sourceCode = context.sourceCode;

  const program = sourceCode.ast;

  const resolved = Arr.generate(function* () {
    for (const rewrite of rewrites) {
      const target = resolveTypeName(
        program,
        rewrite.canonicalName,
        importStyle,
      );

      // The name is already bound to something else in this file, so the rewrite
      // would resolve to the wrong declaration.
      if (target !== undefined) {
        yield { rewrite, target };
      }
    }
  });

  const importNames = Arr.uniq(
    resolved
      .filter(({ target }) => target.needsImport)
      .map(({ rewrite }) => rewrite.canonicalName),
  );

  // The fix that imports them all: the first that needs an import at all.
  const batchIndex = resolved.findIndex(({ target }) => target.needsImport);

  for (const [index, { rewrite, target }] of resolved.entries()) {
    const replacement = `${target.localName}<${rewrite.typeArgs}>`;

    context.report({
      node: rewrite.node,
      messageId,
      data: { original: sourceCode.getText(rewrite.node), replacement },
      fix: (fixer) =>
        Arr.toPushed(
          buildTypeImportFix(
            fixer,
            sourceCode,
            index === batchIndex
              ? importNames
              : target.needsImport
                ? [rewrite.canonicalName]
                : [],
          ),
          fixer.replaceText(rewrite.node, replacement),
        ),
    });
  }
};
