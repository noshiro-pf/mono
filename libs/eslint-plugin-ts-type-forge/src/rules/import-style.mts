import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';
import {
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
 * whether the fix has to add an import for it.
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
