import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';
import { isTypeWrapper, skipTypeWrappers } from './type-wrappers.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Every `import … from '<moduleName>'` declaration in the file, not only the
 * first: `import type { A } from 'm'` and `import { b } from 'm'` are two
 * declarations, and a name imported by either is in scope.
 */
export const getImportDeclarations = (
  program: TSESTree.Program,
  moduleName: string,
): readonly TSESTree.ImportDeclaration[] =>
  program.body.filter(
    (node): node is TSESTree.ImportDeclaration =>
      node.type === AST_NODE_TYPES.ImportDeclaration &&
      node.source.value === moduleName,
  );

/**
 * The exported names `declarations` import by name, whatever they are bound to
 * locally: `import { a, b as c }` gives `a` and `b`.
 */
export const getNamedImports = (
  declarations: DeepReadonly<TSESTree.ImportDeclaration[]>,
): readonly string[] =>
  declarations.flatMap((declaration) =>
    declaration.specifiers.flatMap((specifier) =>
      specifier.type === AST_NODE_TYPES.ImportSpecifier
        ? [importedNameOf(specifier)]
        : [],
    ),
  );

/**
 * The local name `declarations` bind the export `importedName` to, or
 * `undefined` when they do not import it: `'y'` for `import { x as y }`. A fix
 * writes this rather than the exported name, which may not be in scope.
 */
export const getImportedLocalName = (
  declarations: DeepReadonly<TSESTree.ImportDeclaration[]>,
  importedName: string,
): string | undefined =>
  declarations
    .flatMap((declaration) => declaration.specifiers)
    .find(
      (specifier) =>
        specifier.type === AST_NODE_TYPES.ImportSpecifier &&
        importedNameOf(specifier) === importedName,
    )?.local.name;

/** What {@link buildCalleeResolver}'s resolver says a callee calls. */
export type ResolvedCallee = Readonly<{
  /** The exported name, whatever the callee calls it locally. */
  canonicalName: string;

  /**
   * The identifier to rewrite to change what is called: the callee itself for
   * a named import, the property for a namespace import.
   */
  propertyNode: TSESTree.Identifier;

  /** Whether the call goes through a namespace import (`m.f(...)`). */
  isNamespace: boolean;
}>;

/**
 * Builds a function that says which export of the module `declarations`
 * import a callee calls, or `undefined` when it calls none of them. It knows
 * named imports, aliased ones (`import { f as g }` → `g(...)` calls `f`) and
 * namespace imports (`import * as m` → `m.f(...)`), and reads both the callee
 * and a namespace object through their type wrappers:
 * `(f as (u: unknown) => boolean)(x)` and `(m as typeof m).f(x)` still call
 * `f`.
 */
export const buildCalleeResolver = (
  declarations: DeepReadonly<TSESTree.ImportDeclaration[]>,
): ((callee: TSESTree.Expression) => ResolvedCallee | undefined) => {
  const specifiers = declarations.flatMap(
    (declaration) => declaration.specifiers,
  );

  const namespaceNames: ReadonlySet<string> = new Set(
    specifiers.flatMap((specifier) =>
      specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier
        ? [specifier.local.name]
        : [],
    ),
  );

  const localToCanonical: ReadonlyMap<string, string> = new Map(
    specifiers.flatMap((specifier) =>
      specifier.type === AST_NODE_TYPES.ImportSpecifier
        ? [[specifier.local.name, importedNameOf(specifier)] as const]
        : [],
    ),
  );

  const resolve = (callee: TSESTree.Expression): ResolvedCallee | undefined => {
    if (isTypeWrapper(callee)) {
      return resolve(callee.expression);
    }

    if (callee.type === AST_NODE_TYPES.Identifier) {
      const canonicalName = localToCanonical.get(callee.name);

      return canonicalName === undefined
        ? undefined
        : { canonicalName, propertyNode: callee, isNamespace: false };
    }

    if (
      callee.type !== AST_NODE_TYPES.MemberExpression ||
      callee.computed ||
      callee.property.type !== AST_NODE_TYPES.Identifier
    ) {
      return undefined;
    }

    const object = skipTypeWrappers(callee.object);

    return object.type === AST_NODE_TYPES.Identifier &&
      namespaceNames.has(object.name)
      ? {
          canonicalName: callee.property.name,
          propertyNode: callee.property,
          isNamespace: true,
        }
      : undefined;
  };

  return resolve;
};

/**
 * A fix that inserts `import { <specifiers> } from '<moduleName>';` at the top
 * of the file, or no fix when `specifiers` is empty. Each specifier is written
 * as given, so `type T` imports a type.
 *
 * The placement is deliberately naive: an import sorter
 * (prettier-plugin-organize-imports or any equivalent) merges and orders it
 * afterwards. Put every name one report needs into a single call: ESLint
 * merges the fixes of one report into one edit, and two fixes inserting at the
 * start of the file conflict, so that one of them is dropped.
 */
export const buildNamedImportFix = (
  fixer: TSESLint.RuleFixer,
  program: TSESTree.Program,
  moduleName: string,
  specifiers: readonly string[],
): readonly TSESLint.RuleFix[] =>
  specifiers.length === 0
    ? ([] as const)
    : ([
        fixer.insertTextBefore(
          program,
          `import { ${specifiers.join(', ')} } from '${moduleName}';\n`,
        ),
      ] as const);

const importedNameOf = (
  specifier: DeepReadonly<TSESTree.ImportSpecifier>,
): string =>
  specifier.imported.type === AST_NODE_TYPES.Identifier
    ? specifier.imported.name
    : specifier.imported.value;
