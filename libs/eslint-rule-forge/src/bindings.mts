import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether `name`, read at `node`, resolves to something this file writes down —
 * a declaration, a parameter, an import — rather than to a global or a
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
 * Whether `name`, read at `node`, resolves to a value that exists when the code
 * runs — a variable, a function, a class, an enum, a parameter, a value import,
 * a function's `arguments` — so that reading it cannot throw a `ReferenceError`
 * (the temporal dead zone aside, where `typeof` throws too). A global, a name
 * only `declare`d, a type-only import, and a `const enum`, which compiles away,
 * may not exist then.
 *
 * A binding with no value meaning — a type parameter, a type alias, an
 * interface — is passed over at every level, since a value read through it
 * reaches whatever is outside.
 */
export const isRuntimeBound = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
  name: string,
): boolean => {
  const variable = findVariableFrom(
    sourceCode.getScope(node),
    name,
    (candidate) => !isTypeOnly(candidate),
  );

  if (variable === undefined) {
    return false;
  }

  // A variable the scope manager makes itself: a global it knows of from `lib`,
  // which may be absent, or a function's `arguments`, which is not.
  return variable.defs.length === 0
    ? variable.scope.type !== TSESLint.Scope.ScopeType.global
    : variable.defs.some(createsValue);
};

/**
 * Whether `name`, read at `node`, resolves to a binding that is not an import
 * from `moduleName` (or from any of them, given several) — a declaration, a
 * parameter, or an import from another module. A fix that makes code at `node`
 * refer to `moduleName`'s export `name` has to give up then, because the name
 * would refer to that binding instead.
 *
 * The innermost binding decides: an import from `moduleName` at the top of the
 * file does not help a name a function shadows around `node`. A binding with no
 * value meaning inside the file — a type parameter, a local type alias or
 * interface — is passed over, since a type does not shadow a value or the head
 * of a qualified name. At the top of the file it still counts: the import a fix
 * adds there conflicts with it when the export has a type meaning too. A fix
 * that writes the name alone in a type position, where such a binding does
 * capture it, has to check for one itself.
 */
export const hasForeignBinding = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
  name: string,
  moduleName: string | readonly string[],
): boolean => {
  const variable = findShadowingVariable(sourceCode.getScope(node), name);

  const moduleNames: readonly string[] =
    typeof moduleName === 'string' ? ([moduleName] as const) : moduleName;

  return (
    variable?.defs.some((def) =>
      moduleNames.every((m) => !isImportFrom(def, m)),
    ) ?? false
  );
};

/**
 * Whether every definition of `variable` is a type parameter, type alias or
 * interface. Read from `def.type` rather than `isValueVariable`, which ESLint's
 * own scope manager, used with its default parser, does not have.
 */
const isTypeOnly = (variable: TSESLint.Scope.Variable): boolean =>
  variable.defs.length > 0 &&
  variable.defs.every((def) => def.type === TSESLint.Scope.DefinitionType.Type);

/**
 * Whether `scope` is the file's own, where an added import lands: the module or
 * global scope, or the function scope a CommonJS file wraps around them.
 */
const isTopLevel = (scope: TSESLint.Scope.Scope): boolean =>
  scope.block.type === AST_NODE_TYPES.Program;

/**
 * The innermost variable named `name` from `scope` outwards that `accept`
 * takes, given the scope it is declared in.
 */
const findVariableFrom = (
  scope: TSESLint.Scope.Scope,
  name: string,
  accept: (
    candidate: TSESLint.Scope.Variable,
    declaredIn: TSESLint.Scope.Scope,
  ) => boolean,
): TSESLint.Scope.Variable | undefined => {
  const variable = scope.set.get(name);

  return variable !== undefined && accept(variable, scope)
    ? variable
    : scope.upper === null
      ? undefined
      : findVariableFrom(scope.upper, name, accept);
};

/**
 * The innermost variable named `name` from `scope` outwards that a value of
 * that name written in `scope` would meet: one with a value meaning, or any at
 * the top of the file.
 */
const findShadowingVariable = (
  scope: TSESLint.Scope.Scope,
  name: string,
): TSESLint.Scope.Variable | undefined =>
  findVariableFrom(
    scope,
    name,
    (variable, declaredIn) => !isTypeOnly(variable) || isTopLevel(declaredIn),
  );

/** Whether `node` is a declaration written with `declare`. */
const isDeclared = (node: TSESTree.Node): boolean =>
  (node.type === AST_NODE_TYPES.ClassDeclaration ||
    node.type === AST_NODE_TYPES.TSDeclareFunction ||
    node.type === AST_NODE_TYPES.TSEnumDeclaration ||
    node.type === AST_NODE_TYPES.TSModuleDeclaration ||
    node.type === AST_NODE_TYPES.VariableDeclaration) &&
  node.declare;

/** Whether `node` is one of the three kinds of `import … from` specifier. */
const isImportSpecifierNode = (
  node: TSESTree.Node,
): node is
  | TSESTree.ImportDefaultSpecifier
  | TSESTree.ImportNamespaceSpecifier
  | TSESTree.ImportSpecifier =>
  node.type === AST_NODE_TYPES.ImportSpecifier ||
  node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
  node.type === AST_NODE_TYPES.ImportNamespaceSpecifier;

/**
 * Whether `node` is a type-only import binding: a specifier under `import type`
 * or marked `type` inline, or an `import type u = require(…)`.
 */
const isTypeOnlyImport = (node: TSESTree.Node): boolean =>
  (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration &&
    node.importKind === 'type') ||
  (node.type === AST_NODE_TYPES.ImportSpecifier &&
    node.importKind === 'type') ||
  (isImportSpecifierNode(node) &&
    node.parent.type === AST_NODE_TYPES.ImportDeclaration &&
    node.parent.importKind === 'type');

/**
 * Whether `def` creates a value when the code runs: it is not a type, a
 * type-only import, a `const enum` or a `declare`. A name declared inside a
 * `declare global`, `declare module` or `declare namespace` block is not
 * visible outside it, so only the declaration itself and the
 * `VariableDeclaration` above a declarator need checking.
 */
const createsValue = (def: TSESLint.Scope.Definition): boolean =>
  def.type !== TSESLint.Scope.DefinitionType.Type &&
  !isTypeOnlyImport(def.node) &&
  !(def.node.type === AST_NODE_TYPES.TSEnumDeclaration && def.node.const) &&
  !isDeclared(def.node) &&
  !(
    def.node.type === AST_NODE_TYPES.VariableDeclarator &&
    isDeclared(def.node.parent)
  );

/**
 * Whether `def` is a binding an `import … from '<moduleName>'` declaration
 * introduces.
 */
const isImportFrom = (
  def: TSESLint.Scope.Definition,
  moduleName: string,
): boolean =>
  isImportSpecifierNode(def.node) &&
  def.node.parent.type === AST_NODE_TYPES.ImportDeclaration &&
  def.node.parent.source.value === moduleName;
