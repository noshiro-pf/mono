import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';
import {
  buildTypeImportFix,
  getImportedLocalName,
  getTsTypeForgeImports,
  hasConflictingDeclaration,
} from './import-utils.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/** `JSONSchema4`, reached through the public rule-module types. */
type JsonSchema = Exclude<
  TSESLint.RuleModule<string, readonly unknown[]>['meta']['schema'],
  readonly unknown[]
>;

export type ImportStyle = 'global' | 'named';

export const DEFAULT_IMPORT_STYLE: ImportStyle = 'named';

export const IMPORT_STYLE_SCHEMA_PROPERTY: JsonSchema = {
  type: 'string',
  enum: ['global', 'named'],
  description: [
    'How the ts-type-forge type is brought into scope.',
    "'named' (default) makes the autofix add the corresponding",
    `\`import { type … } from '${TS_TYPE_FORGE_MODULE}';\``,
    "when the name is not imported yet; 'global' assumes the",
    'ambient globals of `ts-type-forge/global` and never touches',
    'imports.',
  ].join(' '),
};

/**
 * Resolves how a ts-type-forge type name should be written in this file, and
 * whether the autofix has to add an import for it.
 *
 * Returns `undefined` when the name is already bound to something else (a local
 * alias, or an import from another module) — rewriting to it would then silently
 * resolve to the wrong declaration, which is exactly what happens inside
 * ts-type-forge's own sources.
 */
export const resolveTypeName = (
  program: TSESTree.Program,
  canonicalName: string,
  importStyle: ImportStyle,
): Readonly<{ localName: string; needsImport: boolean }> | undefined => {
  const importedLocalName = getImportedLocalName(
    getTsTypeForgeImports(program),
    canonicalName,
  );

  if (importedLocalName !== undefined) {
    return { localName: importedLocalName, needsImport: false };
  }

  return hasConflictingDeclaration(program, canonicalName)
    ? undefined
    : { localName: canonicalName, needsImport: importStyle === 'named' };
};

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
