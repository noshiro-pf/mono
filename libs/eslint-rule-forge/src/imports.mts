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
 * of the file, after its directive prologue (`'use client';` stays a
 * directive), or no fix when `specifiers` is empty. Each specifier is written
 * as given, so `type T` imports a type.
 *
 * Use it only when the file does not import from `moduleName` by name;
 * {@link bindValueImports} adds to an existing declaration instead, which
 * keeps `import-x/no-duplicates` satisfied, and falls back to this. An import
 * sorter orders the declaration afterwards. Put every name one report needs
 * into a single call: ESLint merges the fixes of one report into one edit,
 * and two fixes inserting at the same place conflict, so that one of them is
 * dropped.
 */
export const buildNamedImportFix = (
  fixer: TSESLint.RuleFixer,
  program: TSESTree.Program,
  moduleName: string,
  specifiers: readonly string[],
): readonly TSESLint.RuleFix[] => {
  if (specifiers.length === 0) {
    return [] as const;
  }

  const declaration =
    `import { ${specifiers.join(', ')} } from '${moduleName}';` as const;

  const lastDirective = program.body
    .filter(
      (statement): statement is TSESTree.ExpressionStatement =>
        statement.type === AST_NODE_TYPES.ExpressionStatement &&
        statement.directive !== undefined,
    )
    .at(-1);

  if (lastDirective === undefined) {
    return [fixer.insertTextBefore(program, `${declaration}\n`)] as const;
  }

  // After the comments that start on the directive's last line as well: one
  // such as `// eslint-disable-line` is about that line.
  const anchor =
    (program.comments ?? [])
      .filter(
        (comment) =>
          comment.range[0] >= lastDirective.range[1] &&
          comment.loc.start.line === lastDirective.loc.end.line,
      )
      .at(-1) ?? lastDirective;

  return [fixer.insertTextAfter(anchor, `\n${declaration}`)] as const;
};

/**
 * The local names `moduleName`'s exports `exportNames` are bound to as values
 * once `edits` are made, in the same order, or `undefined` when one of them
 * cannot be bound.
 *
 * - Imported as a value: that local name, and no edit.
 * - Imported by `import { type x }`: the edit drops `type`, keeping a comment
 *   after it.
 * - Not imported: the edit adds it to the first named import from the module
 *   that has a value specifier, or else to any named import from it that is
 *   not `import type`. Adding it there rather than in a new declaration keeps
 *   `import-x/no-duplicates` satisfied. Failing that, it goes into braces
 *   after a lone default import (`import D, { x }`), and when the module has
 *   neither, a new declaration goes after the directive prologue
 *   ({@link buildNamedImportFix}).
 * - Refused when an import already binds the name to something else
 *   (`import type { x }`, `import { y as x }`, `import { x } from 'other'`),
 *   where adding it would be a duplicate binding.
 *
 * ESLint's default parser leaves `importKind` out, which counts as a value
 * import. Every name a fix writes is bound by that fix's own edits rather than
 * left to another report's: an editor applies one fix at a time, and a fix
 * that loses a conflict with another in the same pass is dropped. Fixes that
 * all add a name overlap, so `--fix` applies one per pass, and the rest in the
 * next, by when the file imports it. Whether something other than an import
 * binds the name where it is written is the caller's to check
 * ({@link hasForeignBinding}).
 */
export const bindValueImports = (
  sourceCode: TSESLint.SourceCode,
  moduleName: string,
  exportNames: readonly string[],
): ValueImportBinding | undefined => {
  const program = sourceCode.ast;

  const allImports = program.body.filter(
    (node): node is TSESTree.ImportDeclaration =>
      node.type === AST_NODE_TYPES.ImportDeclaration,
  );

  const declarations = getImportDeclarations(program, moduleName);

  const named = declarations.flatMap((declaration) =>
    declaration.specifiers.flatMap((specifier) =>
      specifier.type === AST_NODE_TYPES.ImportSpecifier
        ? [{ declaration, specifier }]
        : [],
    ),
  );

  const bindings = exportNames.map((exportName) =>
    bindingOf(sourceCode, allImports, named, exportName),
  );

  if (bindings.includes(undefined)) {
    return undefined;
  }

  const defined = bindings.filter((b) => b !== undefined);

  const toAdd = defined.flatMap((b) => (b.isAdded ? [b.localName] : []));

  const host = (
    named.find(isValueImport) ?? named.find(isNotTypeOnly)
  )?.declaration.specifiers.at(-1);

  // `import D from 'm'` takes `, { x }`: a second declaration beside it would
  // be a duplicate.
  const defaultHost = declarations.find(
    (declaration) =>
      declaration.importKind !== 'type' &&
      declaration.specifiers.length === 1 &&
      declaration.specifiers[0]?.type === AST_NODE_TYPES.ImportDefaultSpecifier,
  )?.specifiers[0];

  return {
    localNames: defined.map((b) => b.localName),
    edits: (fixer) => [
      ...defined.flatMap((b) => b.edits(fixer)),
      ...(toAdd.length === 0
        ? []
        : host !== undefined
          ? [fixer.insertTextAfter(host, `, ${toAdd.join(', ')}`)]
          : defaultHost !== undefined
            ? [fixer.insertTextAfter(defaultHost, `, { ${toAdd.join(', ')} }`)]
            : buildNamedImportFix(fixer, program, moduleName, toAdd)),
    ],
  };
};

/** The exported name `specifier` imports: `x` for `import { x as y }`. */
export const importedNameOf = (
  specifier: DeepReadonly<TSESTree.ImportSpecifier>,
): string =>
  specifier.imported.type === AST_NODE_TYPES.Identifier
    ? specifier.imported.name
    : specifier.imported.value;

/** What {@link bindValueImports} gives. */
export type ValueImportBinding = Readonly<{
  /** The names to write, in the order of the export names asked for. */
  localNames: readonly string[];

  /** The edits that bring every one of them into scope. */
  edits: (fixer: TSESLint.RuleFixer) => readonly TSESLint.RuleFix[];
}>;

type NamedSpecifier = Readonly<{
  declaration: TSESTree.ImportDeclaration;
  specifier: TSESTree.ImportSpecifier;
}>;

/** The declaration is not `import type`. */
const isNotTypeOnly = ({ declaration }: NamedSpecifier): boolean =>
  declaration.importKind !== 'type';

/** Neither `specifier` nor its declaration says `type`. */
const isValueImport = ({ declaration, specifier }: NamedSpecifier): boolean =>
  isNotTypeOnly({ declaration, specifier }) && specifier.importKind !== 'type';

const bindingOf = (
  sourceCode: TSESLint.SourceCode,
  allImports: readonly TSESTree.ImportDeclaration[],
  named: readonly NamedSpecifier[],
  exportName: string,
):
  | Readonly<{
      localName: string;
      isAdded: boolean;
      edits: (fixer: TSESLint.RuleFixer) => readonly TSESLint.RuleFix[];
    }>
  | undefined => {
  const matching = named.filter(
    ({ specifier }) => importedNameOf(specifier) === exportName,
  );

  const value = matching.find(isValueImport);

  if (value !== undefined) {
    return {
      localName: value.specifier.local.name,
      isAdded: false,
      edits: () => [],
    };
  }

  const inlineType = matching.find(isNotTypeOnly)?.specifier;

  if (inlineType !== undefined) {
    const typeKeyword = sourceCode.getFirstToken(inlineType);

    // Up to whatever follows `type`, a comment included, so that the comment
    // stays.
    const next =
      typeKeyword === null
        ? null
        : sourceCode.getTokenAfter(typeKeyword, { includeComments: true });

    return typeKeyword === null || next === null
      ? undefined
      : {
          localName: inlineType.local.name,
          isAdded: false,
          edits: (fixer) => [
            fixer.removeRange([typeKeyword.range[0], next.range[0]]),
          ],
        };
  }

  const isTaken = allImports.some((declaration) =>
    declaration.specifiers.some(
      (specifier) => specifier.local.name === exportName,
    ),
  );

  return isTaken
    ? undefined
    : { localName: exportName, isAdded: true, edits: () => [] };
};
