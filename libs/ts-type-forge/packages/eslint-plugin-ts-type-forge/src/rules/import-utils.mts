import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/** Every `import ... from 'ts-type-forge'` declaration in the file. */
export const getTsTypeForgeImports = (
  program: TSESTree.Program,
): readonly TSESTree.ImportDeclaration[] =>
  program.body.filter(
    (node): node is TSESTree.ImportDeclaration =>
      node.type === AST_NODE_TYPES.ImportDeclaration &&
      node.source.value === TS_TYPE_FORGE_MODULE,
  );

/**
 * Returns the in-scope local name a given ts-type-forge export is imported as
 * (handling aliases such as `import type { NonEmptyArray as NEA }` → `'NEA'`),
 * or `undefined` when it is not imported. Used so autofixes reference the
 * binding that actually exists rather than the canonical name.
 */
export const getImportedLocalName = (
  importDeclarations: readonly TSESTree.ImportDeclaration[],
  importedName: string,
): string | undefined =>
  importDeclarations
    .flatMap((declaration) => declaration.specifiers)
    .find(
      (specifier) =>
        specifier.type === AST_NODE_TYPES.ImportSpecifier &&
        (specifier.imported.type === AST_NODE_TYPES.Identifier
          ? specifier.imported.name
          : specifier.imported.value) === importedName,
    )?.local.name;

/**
 * Whether the file already binds `name` to something that is not the
 * ts-type-forge export of the same name — a local type alias / interface /
 * class / enum, or an import from another module. Autofixes that introduce
 * `name` must bail out in that case, because the rewritten type would resolve
 * to the wrong declaration. (ts-type-forge's own sources, which declare
 * `NonEmptyArray` themselves, are the motivating example.)
 */
export const hasConflictingDeclaration = (
  program: TSESTree.Program,
  name: string,
): boolean =>
  program.body.some((node) => {
    if (node.type === AST_NODE_TYPES.ImportDeclaration) {
      return (
        node.source.value !== TS_TYPE_FORGE_MODULE &&
        node.specifiers.some((specifier) => specifier.local.name === name)
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

/**
 * Inserts `import { type <name> } from 'ts-type-forge';` at the top of the
 * file. Placement is deliberately naive: prettier-plugin-organize-imports (or
 * any equivalent) merges and sorts it afterwards.
 */
export const buildTypeImportFix = (
  fixer: TSESLint.RuleFixer,
  program: TSESTree.Program,
  name: string,
): readonly TSESLint.RuleFix[] =>
  [
    fixer.insertTextBefore(
      program,
      `import { type ${name} } from '${TS_TYPE_FORGE_MODULE}';\n`,
    ),
  ] as const;

const declaresName = (
  node: TSESTree.Node | null | undefined,
  name: string,
): boolean => {
  if (node === null || node === undefined) return false;

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

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */
