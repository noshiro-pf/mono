import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
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
 * Whether `name` resolves, at `node`, to a binding that is not a ts-fortress
 * import — a local declaration, a parameter, or an import from another module.
 * An autofix that makes a call reference `name` must bail out in that case,
 * because the rewritten call would resolve to the wrong binding.
 *
 * Scope-based rather than a scan of the top-level statements, so a binding that
 * merely shadows the ts-fortress one around the call site is caught too.
 */
export const hasForeignBinding = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
  name: string,
): boolean => {
  for (
    let mut_scope: TSESLint.Scope.Scope | null = sourceCode.getScope(node);
    mut_scope !== null;
    mut_scope = mut_scope.upper
  ) {
    const variable = mut_scope.set.get(name);

    // The innermost binding wins, so the first scope that declares `name`
    // decides — an outer ts-fortress import does not rescue a shadowed name.
    if (variable !== undefined) {
      return variable.defs.some((def) => !isTsFortressImportDef(def.node));
    }
  }

  return false;
};

/**
 * Inserts `import { <name> } from 'ts-fortress';` for each name at the top of
 * the file. Placement is deliberately naive: prettier-plugin-organize-imports
 * (or any equivalent) merges and sorts them afterwards.
 *
 * All names go into a single fix on purpose: ESLint merges the fixes of one
 * report into one edit span, so two reports each inserting at the start of the
 * file would conflict and one of them would be dropped.
 */
export const buildImportsFix = (
  fixer: TSESLint.RuleFixer,
  program: TSESTree.Program,
  names: readonly string[],
): readonly TSESLint.RuleFix[] =>
  Arr.isEmpty(names)
    ? ([] as const)
    : ([
        fixer.insertTextBefore(
          program,
          names
            .map((name) => `import { ${name} } from '${TS_FORTRESS_MODULE}';\n`)
            .join(''),
        ),
      ] as const);

const isTsFortressImportDef = (node: TSESTree.Node): boolean =>
  (node.type === AST_NODE_TYPES.ImportSpecifier ||
    node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    node.type === AST_NODE_TYPES.ImportNamespaceSpecifier) &&
  node.parent.type === AST_NODE_TYPES.ImportDeclaration &&
  node.parent.source.value === TS_FORTRESS_MODULE;
