import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as ts from 'typescript';
import { packageNameOf } from '../../lib/package-name.mjs';
import { projectRootPath } from '../../project-root-path.mjs';

/**
 * The import graph of the scripts `tsx` runs, read by TypeScript: what a
 * generator runs, for `check-changed` to know which files outside a package its
 * generator reads (`generator-entries.mts`), and for
 * `generator-inputs.test.mts` to hold `ROOT_GENERATORS` to.
 */

/**
 * A program over `entries` (repository-relative, or absolute), under the
 * settings `tsx` runs the scripts with. An error for a configuration it cannot
 * read, reads with an error, or whose options TypeScript rejects: each would
 * leave the graph short (an option dropped, `paths` among them, leaves the
 * workspace imports unresolved).
 */
export const tsxProgram = (
  entries: readonly string[],
): Result<ts.Program, string> =>
  Result.flatMap(
    Result.mapErr(
      Result.fromThrowable(() =>
        ts.getParsedCommandLineOfConfigFile(
          path.join(projectRootPath, 'tools/configs/tsconfig.tsx.json'),
          {},
          {
            ...ts.sys,
            // The program is built from `entries`, so the files the
            // configuration would include are neither listed nor needed.
            readDirectory: () => [],
            onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
              throw new Error(ts.formatDiagnostics([diagnostic], formatHost));
            },
          },
        ),
      ),
      unknownToString,
    ),
    (parsed): Result<ts.Program, string> => {
      if (parsed === undefined) {
        return Result.err('tools/configs/tsconfig.tsx.json could not be read');
      }

      const configErrors = ts.formatDiagnostics(
        parsed.errors.filter(({ code }) => code !== NO_INPUTS_FOUND),
        formatHost,
      );

      if (configErrors !== '') {
        return Result.err(configErrors);
      }

      const program = ts.createProgram(
        entries.map((entry) => path.resolve(projectRootPath, entry)),
        { ...parsed.options, noEmit: true },
      );

      const optionErrors = ts.formatDiagnostics(
        program.getOptionsDiagnostics(),
        formatHost,
      );

      return optionErrors === ''
        ? Result.ok(program)
        : Result.err(optionErrors);
    },
  );

/**
 * The repository files `entry` runs: those it imports or re-exports by a
 * relative path, a `#` subpath import or an absolute one, and those declaring
 * what it imports or re-exports by name from a workspace library (a namespace
 * or bare import, `export *` or an empty list takes the library's entry and
 * what that re-exports), each with the files they import in turn. A library in
 * `libraries` that does not resolve to its sources — resolved to its build
 * output, or not built at all — is in the graph as its sources whole,
 * `<dir>/src/`, a directory standing for every file under it, with those of
 * every member it may run.
 *
 * The general-purpose libraries every script imports (`ts-data-forge`,
 * `ts-fortress`, `ts-type-forge`, `ts-std-forge`) are left out when imported by
 * name, a subpath of one included: they are covered by their own tests, and
 * following them would run every generator for most library changes. Their own
 * scripts, and what those import from them by a relative path, are followed.
 * `import type` and `export type` run nothing and are left out too, and so is a
 * list of `type` names imported by package name and a dynamic `import()`, which
 * names no module the checker can read. A relative or absolute import of a
 * module that is not there, one the diff deletes, is in the graph by its path
 * and by the source's path a `.mjs` specifier maps to; a `#` import's target is
 * the manifest's to say, and one that is not there is left out.
 */
export const importGraph = (
  program: ts.Program,
  entry: string,
  {
    root = projectRootPath,
    libraries = new Map<string, WorkspaceLibrary>(),
  }: Readonly<{
    /** What the graph's paths are relative to; a test gives another. */
    root?: string;
    /** The workspace members by package name. */
    libraries?: ReadonlyMap<string, WorkspaceLibrary>;
  }> = {},
): readonly string[] => {
  const options = program.getCompilerOptions();

  const checker = program.getTypeChecker();

  const mut_seen = new Set<string>();

  const cache = ts.createModuleResolutionCache(
    root,
    (fileName) => fileName,
    options,
  );

  const byDir = new Map(
    Array.from(libraries.values(), (library) => [library.dir, library]),
  );

  const unfollowedDirs: ReadonlySet<string> = new Set<string>(
    Array.from(
      UNFOLLOWED,
      (name) => libraries.get(name)?.dir ?? `libs/${name}`,
    ),
  );

  const unfollowedPrefixes = Array.from(unfollowedDirs, (dir) => `${dir}/`);

  // A library read whole: its sources, and those of the libraries it may run,
  // `UNFOLLOWED` aside.
  const readWhole = (dir: string): void => {
    const sources = `${dir}/src/` as const;

    if (mut_seen.has(sources)) {
      return;
    }

    mut_seen.add(sources);

    for (const dependency of byDir.get(dir)?.dependencies ?? []) {
      const dependencyDir = libraries.get(dependency)?.dir;

      if (dependencyDir !== undefined && !unfollowedDirs.has(dependencyDir)) {
        readWhole(dependencyDir);
      }
    }
  };

  const visit = (fileName: string, byName: boolean): void => {
    const relative = path.relative(root, fileName);

    if (mut_seen.has(relative)) {
      return;
    }

    // A library resolved to its build output, whose declarations keep only the
    // imports their types need: its sources whole instead.
    const [beforeDist] = relative.split('/dist/', 1);

    const built =
      beforeDist !== undefined &&
      beforeDist !== relative &&
      byDir.has(beforeDist)
        ? beforeDist
        : BUILT_DECLARATION.exec(relative)?.groups?.['library'];

    if (built !== undefined) {
      // Reached by name, one of `UNFOLLOWED` is not followed, as below.
      if (!(byName && unfollowedDirs.has(built))) {
        readWhole(built);
      }

      return;
    }

    if (
      relative.startsWith('..') ||
      relative.includes('node_modules') ||
      // What a library imported by name re-exports from them, `Result` from
      // `ts-repo-utils`. Reached by a relative path — a script of one of them,
      // and what it imports from its own package — they are followed.
      (byName &&
        unfollowedPrefixes.some((prefix) => relative.startsWith(prefix)))
    ) {
      return;
    }

    mut_seen.add(relative);

    const source = program.getSourceFile(fileName);

    if (source === undefined) {
      return;
    }

    for (const statement of source.statements) {
      if (
        !(
          ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)
        ) ||
        statement.moduleSpecifier === undefined ||
        !ts.isStringLiteral(statement.moduleSpecifier) ||
        !runsModule(statement)
      ) {
        continue;
      }

      const { moduleSpecifier } = statement;

      const specifier = moduleSpecifier.text;

      // In the mode the importing file gives it, as the program resolved it
      // (whose own resolution is not in TypeScript's public API).
      const resolve = (): string | undefined =>
        ts.resolveModuleName(
          specifier,
          fileName,
          options,
          ts.sys,
          cache,
          undefined,
          ts.getModeForUsageLocation(source, moduleSpecifier, options),
        ).resolvedModule?.resolvedFileName;

      if (
        specifier.startsWith('.') ||
        specifier.startsWith('#') ||
        path.isAbsolute(specifier)
      ) {
        const target = resolve();

        if (target !== undefined) {
          visit(target, false);
        } else if (!specifier.startsWith('#')) {
          // A module that is not there, deleted by the diff most often, is
          // still what the file runs: by the specifier's path, and by the
          // source's that `tsx` maps a `.mjs` specifier to. A `#` import's
          // target is the manifest's to say.
          const missing = path.resolve(path.dirname(fileName), specifier);

          visit(missing, false);

          visit(missing.replace(/\.([cm]?)js$/u, '.$1ts'), false);
        }

        continue;
      }

      const name = packageNameOf(specifier);

      // A `node:` builtin or a URL; or one of `UNFOLLOWED`.
      if (name === undefined || UNFOLLOWED.has(name)) {
        continue;
      }

      // By package name: each name to the file declaring it, as the library's
      // entry re-exports it; a namespace, a bare import, `export *` or an empty
      // list to the entry itself, which runs every module it re-exports. A list
      // of `type` names alone runs nothing, as `tsx` drops it: taken as running
      // the entry, it would take the whole library for a type.
      const names = namedElements(statement);

      if (
        names !== undefined &&
        Arr.isNonEmpty(names) &&
        names.every(
          (element) => !ts.isIdentifier(element) && element.isTypeOnly,
        )
      ) {
        continue;
      }

      const resolved = resolve();

      // A workspace library not resolved to its sources — built, or not built
      // at all — is read whole.
      const library = libraries.get(name);

      if (
        library !== undefined &&
        (resolved === undefined ||
          !path.relative(root, resolved).startsWith(`${library.dir}/src/`))
      ) {
        readWhole(library.dir);

        continue;
      }

      if (names === undefined || Arr.isEmpty(names)) {
        if (resolved !== undefined) {
          visit(resolved, true);
        }

        continue;
      }

      for (const element of names) {
        if (!ts.isIdentifier(element) && element.isTypeOnly) {
          continue;
        }

        const symbol = ts.isExportSpecifier(element)
          ? checker.getExportSpecifierLocalTargetSymbol(element)
          : checker.getSymbolAtLocation(
              ts.isIdentifier(element) ? element : element.name,
            );

        // An import's symbol is an alias of the declaration; a re-export's is
        // the declaration's own already.
        const target =
          symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias) !== 0
            ? checker.getAliasedSymbol(symbol)
            : symbol;

        for (const declaration of target?.declarations ?? []) {
          visit(declaration.getSourceFile().fileName, true);
        }
      }
    }
  };

  visit(path.resolve(root, entry), false);

  return Array.from(mut_seen).toSorted();
};

/** A workspace member, as `importGraph` follows an import of it by name. */
export type WorkspaceLibrary = Readonly<{
  /** Repository-relative, `/`-separated. */
  dir: string;
  /** The members it may run, by package name (`workspaceLibraries`). */
  dependencies: readonly string[];
}>;

/**
 * A declaration in a workspace library's build output, for a library the caller
 * did not name in `libraries` (a test's graph).
 */
const BUILT_DECLARATION =
  /^(?<library>(?:libs|apps|languages\/[^/]+)\/[^/]+)\/dist\/.+\.d\.[cm]?ts$/u;

export const UNFOLLOWED: ReadonlySet<string> = new Set<string>([
  'ts-data-forge',
  'ts-fortress',
  'ts-type-forge',
  'ts-std-forge',
]);

/**
 * "No inputs were found": the configuration's own files are not listed, since
 * the program is built from the entries alone.
 */
const NO_INPUTS_FOUND = 18_003;

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => projectRootPath,
  getNewLine: () => '\n',
} as const;

/**
 * Whether an import or re-export runs the module it names: not `import type`
 * nor `export type`. A relative one whose every name is marked `type` is taken
 * to run it: `tsx` drops it, but Node's type stripping, which runs a `node`
 * entry, leaves `import {} from` behind, and taking it costs one module.
 */
const runsModule = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a TypeScript node, read only.
  statement: ts.ImportDeclaration | ts.ExportDeclaration,
): boolean =>
  ts.isExportDeclaration(statement)
    ? !statement.isTypeOnly
    : statement.importClause?.phaseModifier !== ts.SyntaxKind.TypeKeyword;

/**
 * The names an import or re-export lists (`import { a }`, `export { a } from`),
 * with a default import as one of them; undefined for a namespace, a bare
 * import or `export *`, which take the module whole.
 */
const namedElements = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a TypeScript node, read only.
  statement: ts.ImportDeclaration | ts.ExportDeclaration,
):
  | readonly (ts.ImportSpecifier | ts.ExportSpecifier | ts.Identifier)[]
  | undefined => {
  if (ts.isExportDeclaration(statement)) {
    const exported = statement.exportClause;

    return exported !== undefined && ts.isNamedExports(exported)
      ? exported.elements
      : undefined;
  }

  const clause = statement.importClause;

  const bindings = clause?.namedBindings;

  if (
    clause === undefined ||
    (bindings !== undefined && !ts.isNamedImports(bindings))
  ) {
    return undefined;
  }

  return [
    ...(clause.name === undefined ? [] : [clause.name]),
    ...(bindings === undefined ? [] : bindings.elements),
  ];
};
