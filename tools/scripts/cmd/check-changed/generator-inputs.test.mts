import * as path from 'node:path';
import * as ts from 'typescript';
import { projectRootPath } from '../../project-root-path.mjs';
import { ROOT_GENERATORS, readsGeneratorInput } from './plan.mjs';

// #3336: a root generator is run when a file it reads changes, and that list is
// declared in `plan.mts`. This holds the declaration to the import graph, so
// that a library function a generator starts calling, or one it calls that
// moves, cannot go unnoticed.
describe('ROOT_GENERATORS', () => {
  test.each(Object.entries(ROOT_GENERATORS))(
    '%s declares every file it imports',
    (_, { entry, inputs }) => {
      const uncovered = importGraph(entry).filter(
        (file) => !readsGeneratorInput(file, inputs),
      );

      assert.deepStrictEqual(uncovered, []);
    },
  );
});

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
const importGraph = (entry: string): readonly string[] => {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    path.join(projectRootPath, 'tools/configs/tsconfig.tsx.json'),
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined },
  );

  assert.isDefined(parsed);

  const options = { ...parsed.options, noEmit: true } as const;

  const program = ts.createProgram(
    [path.join(projectRootPath, entry)],
    options,
  );

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
