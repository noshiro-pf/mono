import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { TS_FORTRESS_MODULE } from './constants.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export type ResolvedCallee = Readonly<{
  /** The canonical (imported) ts-fortress name, regardless of local alias. */
  canonicalName: string;
  /** The identifier node to rewrite when replacing the callee name. */
  propertyNode: TSESTree.Node;
  /** Whether the call was made through a namespace import (`t.foo(...)`). */
  isNamespace: boolean;
}>;

/** Every `import ... from 'ts-fortress'` declaration in the file. */
export const getTsFortressImports = (
  program: TSESTree.Program,
): readonly TSESTree.ImportDeclaration[] =>
  program.body.filter(
    (node): node is TSESTree.ImportDeclaration =>
      node.type === AST_NODE_TYPES.ImportDeclaration &&
      node.source.value === TS_FORTRESS_MODULE,
  );

/**
 * Returns the in-scope local name a given ts-fortress export is imported as
 * (handling aliases such as `import { nonEmptyArray as nea }` → `'nea'`), or
 * `undefined` when it is not imported. Used so autofixes reference the binding
 * that actually exists rather than the canonical name.
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
 * Builds a resolver that maps a call expression's callee to the canonical
 * ts-fortress function it refers to. Handles named imports (including aliases)
 * and namespace imports (`import * as t` → `t.foo(...)`) — the latter being the
 * idiomatic way to consume ts-fortress. Returns `undefined` for any callee that
 * does not reference the given ts-fortress imports.
 */
export const buildCalleeResolver = (
  importDeclarations: readonly TSESTree.ImportDeclaration[],
): ((callee: TSESTree.Expression) => ResolvedCallee | undefined) => {
  const specifiers = importDeclarations.flatMap(
    (declaration) => declaration.specifiers,
  );

  const namespaceNames = new Set(
    specifiers
      .filter(
        (specifier) =>
          specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier,
      )
      .map((specifier) => specifier.local.name),
  );

  const localToCanonical = new Map<string, string>(
    specifiers.flatMap((specifier) => {
      if (specifier.type !== AST_NODE_TYPES.ImportSpecifier) return [];

      const importedName =
        specifier.imported.type === AST_NODE_TYPES.Identifier
          ? specifier.imported.name
          : specifier.imported.value;

      return typeof importedName === 'string'
        ? [[specifier.local.name, importedName] as const]
        : [];
    }),
  );

  return (callee) => {
    if (callee.type === AST_NODE_TYPES.Identifier) {
      const canonicalName = localToCanonical.get(callee.name);

      return canonicalName === undefined
        ? undefined
        : { canonicalName, propertyNode: callee, isNamespace: false };
    }

    return callee.type === AST_NODE_TYPES.MemberExpression &&
      !callee.computed &&
      callee.object.type === AST_NODE_TYPES.Identifier &&
      namespaceNames.has(callee.object.name) &&
      callee.property.type === AST_NODE_TYPES.Identifier
      ? {
          canonicalName: callee.property.name,
          propertyNode: callee.property,
          isNamespace: true,
        }
      : undefined;
  };
};

/**
 * Whether the file already binds `name` to something that is not the
 * ts-fortress export of the same name — a local declaration or an import from
 * another module. Autofixes that introduce `name` must bail out in that case,
 * because the rewritten call would resolve to the wrong binding.
 */
export const hasConflictingDeclaration = (
  program: TSESTree.Program,
  name: string,
): boolean =>
  program.body.some((node) => {
    if (node.type === AST_NODE_TYPES.ImportDeclaration) {
      return (
        node.source.value !== TS_FORTRESS_MODULE &&
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
 * Inserts `import { <name> } from 'ts-fortress';` at the top of the file.
 * Placement is deliberately naive: prettier-plugin-organize-imports (or any
 * equivalent) merges and sorts it afterwards.
 */
export const buildImportFix = (
  fixer: TSESLint.RuleFixer,
  program: TSESTree.Program,
  name: string,
): readonly TSESLint.RuleFix[] =>
  [
    fixer.insertTextBefore(
      program,
      `import { ${name} } from '${TS_FORTRESS_MODULE}';\n`,
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

  if (
    node.type === AST_NODE_TYPES.ClassDeclaration ||
    node.type === AST_NODE_TYPES.FunctionDeclaration
  ) {
    return node.id?.name === name;
  }

  return (
    node.type === AST_NODE_TYPES.VariableDeclaration &&
    node.declarations.some(
      (declarator) =>
        declarator.id.type === AST_NODE_TYPES.Identifier &&
        declarator.id.name === name,
    )
  );
};

/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */
