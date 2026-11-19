import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../../project-root-path.mjs';
import { workspaceLibraries } from './generator-entries.mjs';
import {
  importGraph,
  tsxProgram,
  type WorkspaceLibrary,
} from './import-graph.mjs';
import { readPackages } from './packages.mjs';
import { ROOT_GENERATORS, readsGeneratorInput } from './plan.mjs';

// #3336: a root generator is run when a file it reads changes, and that list is
// declared in `plan.mts`. This holds the declaration to the import graph, so
// that a library function a generator starts calling, or one it calls that
// moves, cannot go unnoticed.
describe('ROOT_GENERATORS', () => {
  const mut_shared: {
    program: ts.Program | undefined;
    libraries: ReadonlyMap<string, WorkspaceLibrary>;
  } = {
    program: undefined,
    libraries: new Map<string, WorkspaceLibrary>(),
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
  beforeAll(async () => {
    // As check-changed reads them, so that a library that is not built is in
    // the graph as its sources whole, as it is there. Reading the members is
    // well under a second beside the program's build, within the same limit.
    mut_shared.libraries = workspaceLibraries(await readPackages());

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

    const built = tsxProgram(
      Object.values(ROOT_GENERATORS).map(({ entry }) => entry),
    );

    if (Result.isErr(built)) {
      throw new Error(built.value);
    }

    const program = built.value;

    program.getTypeChecker();

    mut_shared.program = program;
  }, PROGRAM_BUILD_TIMEOUT_MS);

  // Its ASTs and checker are large, and a worker may run another file next.
  afterAll(() => {
    mut_shared.program = undefined;
  });

  /** The graph of `entry`, and the imports it could not follow. */
  const graphOf = (
    entry: string,
  ): Readonly<{ graph: readonly string[]; unresolved: readonly string[] }> => {
    const { program } = mut_shared;

    assert.isDefined(program);

    const mut_unresolved: string[] = [];

    const graph = importGraph(program, entry, {
      libraries: mut_shared.libraries,
      onUnresolved: (from, specifier) => {
        mut_unresolved.push(
          `${path.relative(projectRootPath, from)}: ${specifier}`,
        );
      },
    });

    return { graph, unresolved: mut_unresolved };
  };

  test.each(Object.entries(ROOT_GENERATORS))(
    '%s declares every file it imports',
    (_, { entry, inputs }) => {
      const { graph, unresolved } = graphOf(entry);

      // What an import that does not resolve would have led to is missing from
      // the graph, which would then pass short: each is named here.
      assert.deepStrictEqual(unresolved, []);

      assert.deepStrictEqual(
        graph.filter((file) => !readsGeneratorInput(file, inputs)),
        [],
      );
    },
  );

  // The other direction, for the modules: an input no file of the graph is left
  // behind when the generator stops importing it, and reruns the generator for
  // nothing. An input that is not a module — a document the generator reads or
  // writes, such as `docs/package-dependencies.md` — is read by the file
  // system, which no import graph sees: those are left to review.
  test.each(Object.entries(ROOT_GENERATORS))(
    '%s declares no module it does not import',
    (_, { entry, inputs }) => {
      const { graph } = graphOf(entry);

      assert.deepStrictEqual(
        inputs.filter(
          (input) =>
            (input.endsWith('/') || MODULE.test(input)) &&
            graph.every((file) => !readsGeneratorInput(file, [input])),
        ),
        [],
      );
    },
  );
});

const PROGRAM_BUILD_TIMEOUT_MS = 60_000;

const MODULE = /\.[cm]?[jt]sx?$/u;
