import * as ts from 'typescript';

/**
 * Whether the value `fileName` exports as `exportName` may be read at runtime
 * by a file of `program`, or is public API because one of `entryPoints`
 * re-exports it.
 *
 * Answered from the import and export declarations of every file in the
 * program, nothing more, and it errs towards "used" wherever they do not
 * decide it: a non-type import counts as a value use whatever the importer does
 * with it, and a namespace or a module that leaves the file whole (a dynamic
 * `import()`, `export { ns }`, `f(ns)`) uses every export. A type-only import or
 * re-export is never a use. A re-export is followed to what imports the
 * re-exporting file, so a barrel is transparent.
 *
 * Files outside `program` are not seen at all, so an importer only counts when
 * the TypeScript project that lints `fileName` includes it.
 */
export const isExportedValueUsed = (
  program: ts.Program,
  fileName: string,
  exportName: string,
  entryPoints: ReadonlySet<string>,
): boolean =>
  isUsed(importEdges(program), entryPoints, fileName, exportName, new Set());

/** One way a file of the program reaches the exports of another. */
type ImportEdge =
  | NamespaceImportEdge
  | Readonly<
      | { kind: 'everything' }
      | { kind: 'named'; name: string }
      | { kind: 're-export'; importer: string; name: string; as: string }
      | { kind: 're-export-all'; importer: string }
      | { kind: 're-export-namespace'; importer: string; as: string }
    >;

type NamespaceImportEdge = Readonly<{
  kind: 'namespace';
  importer: ts.SourceFile;
  localName: string;
}>;

/** The members a namespace import is used through, or every one of them. */
type NamespaceMembers = ReadonlySet<string> | 'all';

/**
 * Keyed by the program, so that every file one program lints shares one scan
 * of the import declarations, and an edit that yields a new program yields a
 * new scan.
 */
const importEdgesCache = new WeakMap<
  ts.Program,
  ReadonlyMap<string, readonly ImportEdge[]>
>();

/**
 * Keyed by the edge, which is only ever created once per program scan, so the
 * entry goes when the scan does.
 */
const namespaceMembersCache = new WeakMap<
  NamespaceImportEdge,
  NamespaceMembers
>();

/** Matches the text a dynamic `import()` or a `require()` call starts with. */
const DYNAMIC_IMPORT_PATTERN = /\b(?:import|require)\s*\(/u;

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

const isUsed = (
  edges: ReadonlyMap<string, readonly ImportEdge[]>,
  entryPoints: ReadonlySet<string>,
  fileName: string,
  exportName: string,
  mut_visited: Set<string>,
): boolean => {
  if (entryPoints.has(fileName)) {
    return true;
  }

  const key = `${fileName}\0${exportName}` as const;

  // A re-export cycle adds nothing the first visit did not already look at.
  if (mut_visited.has(key)) {
    return false;
  }

  mut_visited.add(key);

  const follow = (importer: string, name: string): boolean =>
    isUsed(edges, entryPoints, importer, name, mut_visited);

  return (edges.get(fileName) ?? []).some((edge) => {
    switch (edge.kind) {
      case 'everything':
        return true;

      case 'named':
        return edge.name === exportName;

      case 'namespace': {
        const members = namespaceMembers(edge);

        return members === 'all' || members.has(exportName);
      }

      case 're-export':
        return edge.name === exportName && follow(edge.importer, edge.as);

      case 're-export-all':
        // `export *` does not carry the default export along.
        return exportName !== 'default' && follow(edge.importer, exportName);

      case 're-export-namespace':
        return follow(edge.importer, edge.as);
    }
  });
};

/** Every file's import edges, keyed by the file they point at. */
const importEdges = (
  program: ts.Program,
): ReadonlyMap<string, readonly ImportEdge[]> => {
  const cached = importEdgesCache.get(program);

  if (cached !== undefined) {
    return cached;
  }

  const checker = program.getTypeChecker();

  const mut_edges = new Map<string, ImportEdge[]>();

  const add = (
    moduleSpecifier: ts.Expression,
    ...edges: readonly ImportEdge[]
  ): void => {
    const target = resolveModule(checker, moduleSpecifier);

    if (target === undefined) {
      return;
    }

    const mut_existing = mut_edges.get(target);

    if (mut_existing === undefined) {
      mut_edges.set(target, Array.from(edges));
    } else {
      mut_existing.push(...edges);
    }
  };

  for (const sourceFile of program.getSourceFiles()) {
    if (
      sourceFile.isDeclarationFile ||
      program.isSourceFileFromExternalLibrary(sourceFile) ||
      program.isSourceFileDefaultLibrary(sourceFile)
    ) {
      continue;
    }

    for (const statement of sourceFile.statements) {
      collectStatementEdges(sourceFile, statement, add);
    }

    // Walking the whole file is the expensive part, so only the files that
    // can contain a call worth finding pay for it.
    if (DYNAMIC_IMPORT_PATTERN.test(sourceFile.text)) {
      collectDynamicImportEdges(sourceFile, add);
    }
  }

  importEdgesCache.set(program, mut_edges);

  return mut_edges;
};

const collectStatementEdges = (
  sourceFile: ts.SourceFile,
  statement: ts.Statement,
  add: (
    moduleSpecifier: ts.Expression,
    ...edges: readonly ImportEdge[]
  ) => void,
): void => {
  if (ts.isImportDeclaration(statement)) {
    const clause = statement.importClause;

    // A bare `import './a.mjs'` reads no export, and `import type` reads none
    // at runtime.
    if (clause === undefined || ts.isTypeOnlyImportDeclaration(clause)) {
      return;
    }

    const bindings = clause.namedBindings;

    add(
      statement.moduleSpecifier,
      ...(clause.name === undefined
        ? []
        : [{ kind: 'named', name: 'default' } as const]),
      ...(bindings === undefined
        ? []
        : ts.isNamespaceImport(bindings)
          ? [
              {
                kind: 'namespace',
                importer: sourceFile,
                localName: bindings.name.text,
              } as const,
            ]
          : bindings.elements
              .filter((element) => !element.isTypeOnly)
              .map(
                (element) =>
                  ({
                    kind: 'named',
                    name: (element.propertyName ?? element.name).text,
                  }) as const,
              )),
    );

    return;
  }

  if (ts.isExportDeclaration(statement)) {
    if (statement.moduleSpecifier === undefined || statement.isTypeOnly) {
      return;
    }

    const exportClause = statement.exportClause;

    const importer = sourceFile.fileName;

    add(
      statement.moduleSpecifier,
      ...(exportClause === undefined
        ? [{ kind: 're-export-all', importer } as const]
        : ts.isNamespaceExport(exportClause)
          ? [
              {
                kind: 're-export-namespace',
                importer,
                as: exportClause.name.text,
              } as const,
            ]
          : exportClause.elements
              .filter((element) => !element.isTypeOnly)
              .map(
                (element) =>
                  ({
                    kind: 're-export',
                    importer,
                    name: (element.propertyName ?? element.name).text,
                    as: element.name.text,
                  }) as const,
              )),
    );

    return;
  }

  if (
    ts.isImportEqualsDeclaration(statement) &&
    !statement.isTypeOnly &&
    ts.isExternalModuleReference(statement.moduleReference)
  ) {
    add(statement.moduleReference.expression, { kind: 'everything' });
  }
};

/**
 * `import('./a.mjs')` and `require('./a.mjs')` hand the whole module over, so
 * each counts as a use of every export. `typeof import('./a.mjs')` is a type
 * node rather than a call and is not one.
 */
const collectDynamicImportEdges = (
  sourceFile: ts.SourceFile,
  add: (
    moduleSpecifier: ts.Expression,
    ...edges: readonly ImportEdge[]
  ) => void,
): void => {
  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      const [argument] = node.arguments;

      if (argument !== undefined && ts.isStringLiteralLike(argument)) {
        add(argument, { kind: 'everything' });
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
};

/**
 * The file a module specifier resolves to, through the resolution the program
 * already did. `undefined` for a module that is not a file of the program — a
 * package, an ambient `declare module`, a path that does not resolve.
 */
const resolveModule = (
  checker: ts.TypeChecker,
  moduleSpecifier: ts.Expression,
): string | undefined =>
  checker
    .getSymbolAtLocation(moduleSpecifier)
    ?.declarations?.find(ts.isSourceFile)?.fileName;

const namespaceMembers = (edge: NamespaceImportEdge): NamespaceMembers => {
  const cached = namespaceMembersCache.get(edge);

  if (cached !== undefined) {
    return cached;
  }

  const result = collectNamespaceMembers(edge.importer, edge.localName);

  namespaceMembersCache.set(edge, result);

  return result;
};

/**
 * The members `import * as ns` is read through at runtime — `ns.X` and
 * `ns['X']` — or `'all'` once `ns` is used in any other value position.
 *
 * Shadowing is not tracked: an unrelated `ns` in an inner scope only adds uses,
 * which can hide a report but never makes one up.
 */
const collectNamespaceMembers = (
  sourceFile: ts.SourceFile,
  localName: string,
): NamespaceMembers => {
  const mut_names = new Set<string>();

  const isNamespace = (node: ts.Node): node is ts.Identifier =>
    ts.isIdentifier(node) && node.text === localName;

  // `true` stops the walk: `ns` was used whole, so every member is.
  const visit = (node: ts.Node): boolean | undefined => {
    if (
      ts.isImportDeclaration(node) ||
      // A type reads nothing at runtime — `ns.X` there is a qualified name and
      // `typeof ns.X` a type query. A heritage clause is the exception:
      // `extends ns.Base` is a value.
      (ts.isTypeNode(node) && !ts.isExpressionWithTypeArguments(node))
    ) {
      return undefined;
    }

    if (ts.isPropertyAccessExpression(node) && isNamespace(node.expression)) {
      mut_names.add(node.name.text);

      return undefined;
    }

    if (ts.isElementAccessExpression(node) && isNamespace(node.expression)) {
      if (!ts.isStringLiteralLike(node.argumentExpression)) {
        return true;
      }

      mut_names.add(node.argumentExpression.text);

      return undefined;
    }

    return (
      (isNamespace(node) && !isPropertyName(node)) ||
      ts.forEachChild(node, visit)
    );
  };

  return visit(sourceFile) === true ? 'all' : mut_names;
};

/**
 * Whether an identifier names a property or member rather than referring to a
 * binding — `a.ns`, `{ ns: 1 }`, `class { ns = 1 }`.
 */
const isPropertyName = (node: ts.Identifier): boolean => {
  const parent = node.parent;

  return (
    ((ts.isPropertyAccessExpression(parent) ||
      ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent) ||
      ts.isEnumMember(parent)) &&
      parent.name === node) ||
    (ts.isBindingElement(parent) && parent.propertyName === node)
  );
};
