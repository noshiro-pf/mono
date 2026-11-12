import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import type * as ts from 'typescript';
import { matchScriptNames } from '../../lib/manifest-scripts.mjs';
import { readPnpmRun, readRunAll } from '../../lib/pnpm-command.mjs';
import { readShellCommands } from '../../lib/shell-commands.mjs';
import { projectRootPath } from '../../project-root-path.mjs';
import {
  importGraph,
  tsxProgram,
  type WorkspaceLibrary,
} from './import-graph.mjs';
import { scriptsOf } from './packages.mjs';
import type { PackageInfo } from './plan.mjs';

/**
 * Which members' generators read a file outside the member: a shared module
 * under `tools/configs/` that the eslint plugins' `gen:rule-types` or the apps'
 * `gen:css-module-types` import, for instance. `check-changed` runs a member's
 * `gen` when the diff touches the member; this finds the ones whose `gen` reads
 * a changed file elsewhere, from the import graph of the scripts it runs, so
 * that no list kept by hand has to follow the imports.
 */

/**
 * The scripts a member's `gen` runs with `tsx` or `node`, repository-relative:
 * the files they name, found by following `gen` through the `run-s` / `run-p`
 * lists and the `pnpm run`s of the member's own scripts. An entry may lie
 * outside the member (`../../tools/configs/x.mts`). A command that runs a root
 * script or another program names no entry here.
 */
export const generatorEntries = ({
  dir,
  scripts,
}: Readonly<{
  /** Repository-relative, `/`-separated. */
  dir: string;
  scripts: ReadonlyMap<string, string>;
}>): Result<readonly string[], string> => {
  const names = Array.from(scripts.keys());

  const mut_seen = new Set<string>();

  const mut_entries = new Set<string>();

  const mut_problems: string[] = [];

  const visit = (script: string): void => {
    const body = scripts.get(script);

    if (body === undefined || mut_seen.has(script)) {
      return;
    }

    mut_seen.add(script);

    const reading = readShellCommands(body);

    mut_problems.push(
      ...reading.problems.map(
        (problem) => `${dir}: script \`${script}\`: ${problem}` as const,
      ),
    );

    for (const words of reading.commands) {
      const runAll = readRunAll(words);

      if (runAll !== undefined) {
        for (const pattern of [...runAll.scripts, ...runAll.withArguments]) {
          for (const name of matchScriptNames(pattern, names)) {
            visit(name);
          }
        }

        continue;
      }

      const pnpmRun = readPnpmRun(words);

      if (pnpmRun !== undefined) {
        // One of the member's own; a filtered or root run is another's.
        if (
          Arr.isEmpty(pnpmRun.filters) &&
          !pnpmRun.recursive &&
          !pnpmRun.workspaceRoot &&
          pnpmRun.directory === undefined
        ) {
          visit(pnpmRun.script);
        }

        continue;
      }

      const entry = scriptEntry(words);

      if (entry !== undefined) {
        mut_entries.add(path.posix.normalize(path.posix.join(dir, entry)));
      }
    }
  };

  visit('gen');

  // A script read in part could hide an entry, and with it a generator that
  // would never run.
  return Arr.isNonEmpty(mut_problems)
    ? Result.err(mut_problems.join('; '))
    : Result.ok(Array.from(mut_entries).toSorted());
};

/**
 * For each member, the files outside it among `changed` that its generators
 * import, from one program over every entry; an entry many members share
 * (`libs/ts-repo-utils/src/cmd/gen-index-ts.mts`) is walked once. Only the
 * members that read one are in the result.
 */
export const generatorReadersOf = ({
  members,
  changed,
  libraries,
}: Readonly<{
  members: readonly Readonly<{ dir: string; entries: readonly string[] }>[];
  /** Repository-relative changed modules. */
  changed: readonly string[];
  /** The workspace members by package name (`importGraph`). */
  libraries: ReadonlyMap<string, WorkspaceLibrary>;
}>): Result<ReadonlyMap<string, readonly string[]>, string> => {
  const withEntries = members.filter(({ entries }) => Arr.isNonEmpty(entries));

  if (Arr.isEmpty(withEntries) || Arr.isEmpty(changed)) {
    return Result.ok(new Map<string, readonly string[]>());
  }

  return Result.map(
    tsxProgram(Arr.uniq(withEntries.flatMap(({ entries }) => entries))),
    (program: ts.Program) => {
      const mut_graphs = new Map<string, Graph>();

      const graphOf = (entry: string): Graph => {
        const known = mut_graphs.get(entry);

        if (known !== undefined) {
          return known;
        }

        const read = importGraph(program, entry, { libraries });

        // A path ending in `/` stands for every file under it, as in
        // `readsGeneratorInput`.
        const graph = {
          files: new Set<string>(read),
          directories: read.filter((file) => file.endsWith('/')),
        } as const;

        mut_graphs.set(entry, graph);

        return graph;
      };

      return new Map(
        Arr.generate(function* () {
          for (const { dir, entries } of withEntries) {
            const files = changed.filter(
              (file) =>
                !file.startsWith(`${dir}/`) &&
                entries.some((entry) => reads(graphOf(entry), file)),
            );

            if (Arr.isNonEmpty(files)) {
              yield [dir, files] as const;
            }
          }
        }),
      );
    },
  );
};

/**
 * For each member with a `gen`, the changed files outside it that its
 * generators import (`generator-entries.mts`). Only a module can be imported,
 * so a diff with none builds no program; nor does a test, which a generator
 * does not import. Building the program over every member's entries takes about
 * three seconds, paid by any diff that changes a module.
 *
 * A member found here through a library read whole (one not resolved to its
 * sources, `importGraph` says when), and not among those the plan builds
 * (`buildPlan`'s, for a member that declares it), runs its `gen` against that
 * build as it stands: a stale `dist/` is read as is, as everywhere in
 * check-changed.
 */
export const readGeneratorReaders = async (
  changedFiles: readonly string[],
  packages: readonly PackageInfo[],
): Promise<Result<ReadonlyMap<string, readonly string[]>, string>> => {
  const modules = changedFiles.filter(
    (file) =>
      /\.(?:[cm]?[jt]s|tsx)$/u.test(file) &&
      !/\.test\.(?:[cm]?[jt]s|tsx)$/u.test(file),
  );

  if (Arr.isEmpty(modules)) {
    return Result.ok(new Map<string, readonly string[]>());
  }

  const members = await readGeneratorMembers(packages);

  return Result.isErr(members)
    ? members
    : generatorReadersOf({
        members: members.value,
        changed: modules,
        libraries: workspaceLibraries(packages),
      });
};

/**
 * Each member with a `gen`, with the entries of its generators; read again from
 * its manifest, since `PackageInfo` keeps the script names alone. One whose
 * scripts cannot be read in full is an error, whatever member the diff touches:
 * a script read in part could hide an entry, and with it a generator that would
 * never run.
 */
export const readGeneratorMembers = async (
  packages: readonly PackageInfo[],
): Promise<
  Result<
    readonly Readonly<{ dir: string; entries: readonly string[] }>[],
    string
  >
> => {
  const read = await Promise.all(
    packages
      .filter(({ scripts }) => scripts.has('gen'))
      .map(async ({ dir }) => {
        const manifest = await Result.fromPromise(
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workspace member's manifest.
          fs.readFile(path.join(projectRootPath, dir, 'package.json'), 'utf8'),
        );

        const parsed = Result.flatMap(manifest, (text) =>
          Result.fromThrowable((): unknown => JSON.parse(text)),
        );

        return Result.isErr(parsed)
          ? Result.err(
              `${dir}/package.json: ${unknownToString(parsed.value)}` as const,
            )
          : Result.map(
              generatorEntries({ dir, scripts: scriptsOf(parsed.value) }),
              (entries) => ({ dir, entries }),
            );
      }),
  );

  const unread = read.filter(Result.isErr).map(({ value }) => value);

  return Arr.isNonEmpty(unread)
    ? Result.err(unread.join('\n'))
    : Result.ok(read.filter(Result.isOk).map(({ value }) => value));
};

/**
 * The workspace members by package name, as `importGraph` takes them, each with
 * the members it may run (`runtimeMembers`, read from its manifest alone, so
 * that an install not yet run or run in part changes nothing).
 */
export const workspaceLibraries = (
  packages: readonly PackageInfo[],
): ReadonlyMap<string, WorkspaceLibrary> =>
  new Map(
    packages.map(({ name, dir, runtimeMembers }) => [
      name,
      { dir, dependencies: Array.from(runtimeMembers) },
    ]),
  );

type Graph = Readonly<{
  files: ReadonlySet<string>;
  directories: readonly string[];
}>;

/** The programs whose first file argument is the script they run. */
const SCRIPT_RUNNERS: ReadonlySet<string> = new Set<string>(['tsx', 'node']);

/** The flags of `tsx` and `node` whose value is not the script. */
const VALUE_FLAGS: ReadonlySet<string> = new Set<string>([
  '--tsconfig',
  '--import',
  '--require',
  '-r',
  '--conditions',
  '-C',
  '--loader',
  '--experimental-loader',
  '--env-file',
  '--input-type',
  '--title',
]);

/** Whether a graph holds `file`, itself or under a directory it holds. */
const reads = (graph: Graph, file: string): boolean =>
  graph.files.has(file) ||
  graph.directories.some((directory) => file.startsWith(directory));

/**
 * The script a `tsx` or `node` command runs: its first argument that is no flag
 * nor a flag's value, when it names a module (`.mts`, `.ts`, `.tsx`, `.mjs`,
 * `.js` and the like).
 */
const scriptEntry = (words: readonly string[]): string | undefined => {
  if (!SCRIPT_RUNNERS.has(words[0] ?? '')) {
    return undefined;
  }

  const script = Arr.tail(words).find(
    (word, index, rest) =>
      !word.startsWith('-') && !VALUE_FLAGS.has(rest[index - 1] ?? ''),
  );

  return script !== undefined && /\.(?:[cm]?[jt]s|tsx)$/u.test(script)
    ? script
    : undefined;
};
