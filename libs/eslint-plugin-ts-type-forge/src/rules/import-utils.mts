import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether the file already binds `name` to something that is not the
 * ts-type-forge export of the same name — a local type alias / interface /
 * class / enum, or an import from another module. Autofixes that introduce
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
