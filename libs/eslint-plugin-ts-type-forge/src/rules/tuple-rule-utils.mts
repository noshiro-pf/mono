import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { resolveTypeName, type ImportStyle } from './import-style.mjs';
import { buildTypeImportFix } from './import-utils.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export type TupleRewrite = Readonly<{
  node: TSESTree.Node;
  canonicalName: string;
  /** Text inside the `<...>` of the replacement, e.g. `'2, string'`. */
  typeArgs: string;
}>;

/**
 * Emits one report per rewrite, resolving each target name and attaching every
 * required import to the *first* report.
 *
 * All import fixes must live on a single report: `insertTextBefore(program, …)`
 * produces overlapping ranges, and ESLint merges each report's fixes into one
 * span — so spreading them across reports makes the fixes conflict and only one
 * survives per pass.
 */
export const reportTupleRewrites = <MessageIds extends string>(
  context: TSESLint.RuleContext<MessageIds, readonly unknown[]>,
  rewrites: readonly TupleRewrite[],
  messageId: MessageIds,
  importStyle: ImportStyle,
): void => {
  const sourceCode = context.sourceCode;

  const program = sourceCode.ast;

  const resolved = rewrites.flatMap((rewrite) => {
    const target = resolveTypeName(program, rewrite.canonicalName, importStyle);

    // The name is already bound to something else in this file, so the rewrite
    // would resolve to the wrong declaration.
    return target === undefined ? [] : [{ rewrite, target }];
  });

  const importNames = Array.from(
    new Set(
      resolved
        .filter(({ target }) => target.needsImport)
        .map(({ rewrite }) => rewrite.canonicalName),
    ),
  );

  for (const [index, { rewrite, target }] of resolved.entries()) {
    const replacement = `${target.localName}<${rewrite.typeArgs}>`;

    context.report({
      node: rewrite.node,
      messageId,
      data: { original: sourceCode.getText(rewrite.node), replacement },
      fix: (fixer) =>
        Arr.toPushed(
          index === 0
            ? importNames.flatMap((name) =>
                buildTypeImportFix(fixer, program, name),
              )
            : [],
          fixer.replaceText(rewrite.node, replacement),
        ),
    });
  }
};
