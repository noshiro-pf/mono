import * as path from 'node:path';
import * as ts from 'typescript';
import { projectRootPath } from '../../project-root-path.mjs';
import { ROOT_GENERATORS, readsGeneratorInput } from './plan.mjs';

// #3336: a root generator is run when a file it reads changes, and that list is
// declared in `plan.mts`. This holds the declaration to the import graph, so
// that a library function a generator starts calling, or one it calls that
// moves, cannot go unnoticed.
describe('ROOT_GENERATORS', () => {
  const mut_shared: { program: ts.Program | undefined } = {
    program: undefined,
  };

  // One program over every generator's entry, built with its checker before any
  // case runs. Building it is most of the test's time, about two seconds alone,
  // and under load (Vitest runs the tools' test files in parallel, and
  // CI's `check:root` runs them beside the other root guards) a build inside a
  // case passed the 5 s default. Hence the hook's own limit, long enough for
  // that load: set here rather than for every tools test, where a longer limit
  // would only report a hung test later. Sharing the program cannot change what
  // an import resolves to: the entries are modules, and none declares a
  // global or augments a module another one imports. A build that fails here
  // fails every case at once, which costs nothing: TypeScript does not throw on
  // a broken source file, so what fails it is the configuration or an entry
  // that is no file, each reported by name.
  beforeAll(() => {
    // A generator listed here names an entry that is no file: correct it in
    // ROOT_GENERATORS.
    assert.deepStrictEqual(
      Object.entries(ROOT_GENERATORS)
        .filter(
          ([, { entry }]) =>
            !ts.sys.fileExists(path.join(projectRootPath, entry)),
        )
        .map(([name]) => name),
      [],
    );

    const program = tsxProgram(
      Object.values(ROOT_GENERATORS).map(({ entry }) => entry),
    );

    program.getTypeChecker();

    mut_shared.program = program;
  }, PROGRAM_BUILD_TIMEOUT_MS);

  // Its ASTs and checker are large, and a worker may run another file next.
  afterAll(() => {
    mut_shared.program = undefined;
  });

  test.each(Object.entries(ROOT_GENERATORS))(
    '%s declares every file it imports',
    (_, { entry, inputs }) => {
      const { program } = mut_shared;

      assert.isDefined(program);

      const uncovered = importGraph(program, entry).filter(
        (file) => !readsGeneratorInput(file, inputs),
      );

      assert.deepStrictEqual(uncovered, []);
    },
  );
});

const PROGRAM_BUILD_TIMEOUT_MS = 60_000;

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
 * A program over `entries`, under the settings `tsx` runs the scripts with.
 * Fails on a configuration it cannot read, reads with an error, or whose
 * options TypeScript rejects; an entry that is no file is one of those.
 */
const tsxProgram = (entries: readonly string[]): ts.Program => {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    path.join(projectRootPath, 'tools/configs/tsconfig.tsx.json'),
    {},
    {
      ...ts.sys,
      // The program is built from `entries`, so the files the configuration
      // would include are neither listed nor needed.
      readDirectory: () => [],
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.formatDiagnostics([diagnostic], formatHost));
      },
    },
  );

  // Narrows the type only: an unreadable configuration has thrown above.
  assert.isDefined(parsed);

  // A recoverable error can still drop an option, `paths` among them, which
  // would leave the workspace imports unresolved and the graph short.
  assert.strictEqual(
    ts.formatDiagnostics(
      parsed.errors.filter(({ code }) => code !== NO_INPUTS_FOUND),
      formatHost,
    ),
    '',
  );

  const program = ts.createProgram(
    entries.map((entry) => path.join(projectRootPath, entry)),
    { ...parsed.options, noEmit: true },
  );

  // An option TypeScript rejects leaves the graph as short as one it never
  // read.
  assert.strictEqual(
    ts.formatDiagnostics(program.getOptionsDiagnostics(), formatHost),
    '',
  );

  return program;
};

/**
 * The repository files `entry` runs: those it imports by a relative path, and
 * the files declaring what it imports by name from a workspace library, each
 * with the files they import in turn.
 *
 * The general-purpose libraries every script imports (`ts-data-forge`,
 * `ts-type-forge`, `ts-std-forge`) are left out: they are covered by their own
 * tests, and following them would run every generator for most library changes.
 * A type-only import runs nothing and is left out too.
 */
const importGraph = (program: ts.Program, entry: string): readonly string[] => {
  const options = program.getCompilerOptions();

  const checker = program.getTypeChecker();

  const mut_seen = new Set<string>();

  const visit = (fileName: string): void => {
    const relative = path.relative(projectRootPath, fileName);

    if (
      mut_seen.has(relative) ||
      relative.startsWith('..') ||
      relative.includes('node_modules') ||
      // What a library re-exports from them, `Result` from `ts-repo-utils`.
      Array.from(UNFOLLOWED).some((name) =>
        relative.startsWith(`libs/${name}/`),
      )
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
        !ts.isImportDeclaration(statement) ||
        statement.importClause?.phaseModifier === ts.SyntaxKind.TypeKeyword ||
        !ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        continue;
      }

      const specifier = statement.moduleSpecifier.text;

      if (specifier.startsWith('.')) {
        const resolved = ts.resolveModuleName(
          specifier,
          fileName,
          options,
          ts.sys,
        ).resolvedModule?.resolvedFileName;

        if (resolved !== undefined) {
          visit(resolved);
        }

        continue;
      }

      if (UNFOLLOWED.has(specifier)) {
        continue;
      }

      const bindings = statement.importClause?.namedBindings;

      if (bindings === undefined || !ts.isNamedImports(bindings)) {
        continue;
      }

      for (const element of bindings.elements) {
        if (element.isTypeOnly) {
          continue;
        }

        const symbol = checker.getSymbolAtLocation(element.name);

        const target =
          symbol === undefined ? undefined : checker.getAliasedSymbol(symbol);

        for (const declaration of target?.declarations ?? []) {
          visit(declaration.getSourceFile().fileName);
        }
      }
    }
  };

  visit(path.join(projectRootPath, entry));

  return Array.from(mut_seen).toSorted();
};

const UNFOLLOWED: ReadonlySet<string> = new Set<string>([
  'ts-data-forge',
  'ts-type-forge',
  'ts-std-forge',
]);
