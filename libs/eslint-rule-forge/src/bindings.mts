import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether `name`, read at `node`, resolves to something this file writes down
 * — a declaration, a parameter, an import — rather than to a global or a
 * standard-library type of the same name.
 *
 * The scope manager makes an implicit variable for every reference it cannot
 * resolve, so `findVariable` finds `Exclude` in a file that never declares it;
 * only a variable with a definition was written in the file.
 */
export const isLocallyBound = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
  name: string,
): boolean => {
  const variable = ASTUtils.findVariable(sourceCode.getScope(node), name);

  return variable !== null && variable.defs.length > 0;
};

/**
 * Whether `name`, read at `node`, resolves to a binding that is not an import
 * from `moduleName` — a declaration, a parameter, or an import from another
 * module. A fix that makes code at `node` refer to `moduleName`'s export
 * `name` has to give up then, because the name would refer to that binding
 * instead.
 *
 * The innermost binding decides: an import from `moduleName` at the top of the
 * file does not help a name a function shadows around `node`.
 */
export const hasForeignBinding = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
  name: string,
  moduleName: string,
): boolean => {
  const variable = ASTUtils.findVariable(sourceCode.getScope(node), name);

  return variable?.defs.some((def) => !isImportFrom(def, moduleName)) ?? false;
};

/**
 * Whether `def` is a binding an `import … from '<moduleName>'` declaration
 * introduces.
 */
const isImportFrom = (
  def: TSESLint.Scope.Definition,
  moduleName: string,
): boolean =>
  (def.node.type === AST_NODE_TYPES.ImportSpecifier ||
    def.node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    def.node.type === AST_NODE_TYPES.ImportNamespaceSpecifier) &&
  def.node.parent.type === AST_NODE_TYPES.ImportDeclaration &&
  def.node.parent.source.value === moduleName;
