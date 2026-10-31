import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { getImportDeclarations, getImportedLocalName } from 'eslint-rule-forge';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';
import { hasConflictingDeclaration } from './import-utils.mjs';

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
    "'named' (default) makes the autofix import the type from",
    `\`${TS_TYPE_FORGE_MODULE}\` when the name is not imported yet,`,
    "adding it to an existing import of the module where there is one; 'global' assumes the",
    'ambient globals of `ts-type-forge/global` and never touches',
    'imports.',
  ].join(' '),
};

/**
 * Resolves how a ts-type-forge type name should be written in this file, and
 * whether the fix has to add an import for it.
 *
 * Returns `undefined` when the name is already bound to something else (a local
 * alias, an import from another module, or another ts-type-forge export
 * imported under the name) — rewriting to it would then silently
 * resolve to the wrong declaration, which is exactly what happens inside
 * ts-type-forge's own sources.
 */
export const resolveTypeName = (
  program: TSESTree.Program,
  canonicalName: string,
  importStyle: ImportStyle,
): Readonly<{ localName: string; needsImport: boolean }> | undefined => {
  const importedLocalName = getImportedLocalName(
    getImportDeclarations(program, TS_TYPE_FORGE_MODULE),
    canonicalName,
  );

  return importedLocalName !== undefined
    ? { localName: importedLocalName, needsImport: false }
    : hasConflictingDeclaration(program, canonicalName)
      ? undefined
      : { localName: canonicalName, needsImport: importStyle === 'named' };
};
