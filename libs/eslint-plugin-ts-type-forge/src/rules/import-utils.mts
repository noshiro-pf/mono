import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { addTypeImports, importedNameOf } from 'eslint-rule-forge';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * The edits that import the ts-type-forge types `names` the file does not
 * import yet, as `addTypeImports` places them.
 *
 * Fixes that add an import overlap, so `--fix` applies one per pass, and the
 * rest in later passes, by when the file imports their names (see
 * `resolveTypeName`).
 */
export const buildTypeImportFix = (
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  names: readonly string[],
): readonly TSESLint.RuleFix[] =>
  addTypeImports(fixer, sourceCode, TS_TYPE_FORGE_MODULE, names);

/**
 * Whether the file already binds `name` to something that is not the
 * ts-type-forge export of the same name — a local type alias / interface /
 * class / enum, an import from another module, or another ts-type-forge
 * export imported under that name. Autofixes that introduce
 * `name` must bail out in that case, because the rewritten type would resolve
 * to the wrong declaration. (ts-type-forge's own sources, which declare
 * `NonEmptyArray` themselves, are the motivating example.)
 *
 * Not `hasForeignBinding` from eslint-rule-forge: `resolveTypeName` decides
 * once per file, with no node to read a scope at.
 */
export const hasConflictingDeclaration = (
  program: TSESTree.Program,
  name: string,
): boolean =>
  program.body.some((node) => {
    if (node.type === AST_NODE_TYPES.ImportDeclaration) {
      return node.specifiers.some(
        (specifier) =>
          specifier.local.name === name &&
          !(
            node.source.value === TS_TYPE_FORGE_MODULE &&
            specifier.type === AST_NODE_TYPES.ImportSpecifier &&
            importedNameOf(specifier) === name
          ),
      );
    }

    return declaresName(
      node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
        node.type === AST_NODE_TYPES.ExportDefaultDeclaration
        ? node.declaration
        : node,
      name,
    );
  });

const declaresName = (
  node: TSESTree.Node | null | undefined,
  name: string,
): boolean => {
  if (node === null || node === undefined) {
    return false;
  }

  if (
    node.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
    node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
    node.type === AST_NODE_TYPES.TSEnumDeclaration
  ) {
    return node.id.name === name;
  }

  return (
    node.type === AST_NODE_TYPES.ClassDeclaration && node.id?.name === name
  );
};
