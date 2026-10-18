import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { buildNamedImportFix } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';
import { resolveTypeName, type ImportStyle } from './import-style.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/** One deterministic replacement of a type node by a named ts-type-forge type. */
export type TypeRewrite = Readonly<{
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
                buildNamedImportFix(fixer, program, TS_TYPE_FORGE_MODULE, [
                  `type ${name}`,
                ]),
              )
            : [],
          fixer.replaceText(rewrite.node, replacement),
        ),
    });
  }
};
