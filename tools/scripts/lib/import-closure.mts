/** The modules a TypeScript entry point loads, by walking its imports. */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isNonNullObject,
  isRecord,
  memoizeFunction,
  Result,
} from 'ts-data-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../project-root-path.mjs';
import { listLibraryDirs, readRepositoryFile } from './repo-files.mjs';

/**
 * Every module reachable from `entry` by import, re-export, `import()` or
 * `require()` (as `preProcessImports` reads them), type-only ones included (a
 * change there is still a change to the file), by paths from the repository
 * root.
 *
 * A relative specifier is resolved as the repository writes them, `.mjs` for
 * the `.mts` beside it, or for a `.mjs` file when there is no such `.mts`. A
 * bare one naming a workspace library is entered at its `src/` entry, whatever
 * subpath it names, when `follows` says so, and otherwise listed in
 * `unfollowed`; either way it is listed, as written, in `workspaceImports`.
 * Anything else (`node:*`, a third-party package, a workspace member outside
 * `libs/`) is not followed.
 */
export const walkImports = (
  entry: string,
  {
    readSource: read,
    workspacePackages,
    follows,
    importsOf = preProcessImports,
  }: Readonly<{
    readSource: (relativePath: string) => string | undefined;
    workspacePackages: ReadonlyMap<string, string>;
    follows: (directory: string) => boolean;
    /**
     * What a module imports, given its text: `preProcessImports`, unless a
     * caller walking more than once passes {@link cachedModuleReader}'s.
     */
    importsOf?: (source: string) => readonly string[];
  }>,
): Result<Closure, string> => {
  const mut_files = new Set<string>();

  const mut_unfollowed = new Set<string>();

  const mut_workspaceImports = new Set<string>();

  const mut_queue: string[] = [entry];

  while (Arr.isNonEmpty(mut_queue)) {
    const file = mut_queue.pop();

    if (file === undefined || mut_files.has(file)) {
      continue;
    }

    const source = read(file);

    if (source === undefined) {
      return Result.err(
        file === entry
          ? `${entry} could not be read.`
          : `${file}, imported on the way from ${entry}, could not be read.`,
      );
    }

    mut_files.add(file);

    for (const specifier of importsOf(source)) {
      if (specifier.startsWith('.')) {
        const imported = path.posix.join(path.posix.dirname(file), specifier);

        const typeScript = imported.replace(/\.mjs$/u, '.mts');

        // A JavaScript module of that name (`.markdownlint-cli2.mjs`) when no
        // `.mts` stands beside it.
        mut_queue.push(
          typeScript !== imported &&
            read(typeScript) === undefined &&
            read(imported) !== undefined
            ? imported
            : typeScript,
        );

        continue;
      }

      const packageName = toPackageName(specifier);

      const directory = workspacePackages.get(packageName);

      if (directory === undefined) {
        continue;
      }

      mut_workspaceImports.add(specifier);

      if (!follows(directory)) {
        mut_unfollowed.add(packageName);

        continue;
      }

      const packageEntry = PACKAGE_ENTRIES.map(
        (name) => `${directory}/src/${name}`,
      ).find((candidate) => read(candidate) !== undefined);

      if (packageEntry === undefined) {
        return Result.err(
          `${packageName} has none of ${PACKAGE_ENTRIES.join(', ')} under ${directory}/src/.`,
        );
      }

      mut_queue.push(packageEntry);
    }
  }

  return Result.ok({
    files: Array.from(mut_files).toSorted(),
    unfollowed: Array.from(mut_unfollowed).toSorted(),
    workspaceImports: Array.from(mut_workspaceImports).toSorted(),
  });
};

/**
 * The `readSource` and `importsOf` of {@link walkImports} for a caller walking
 * more than once: each file is read, and each text searched for its imports,
 * once however many walks reach it.
 */
export const cachedModuleReader = (
  read: (relativePath: string) => string | undefined = readSource,
): Readonly<{
  readSource: (relativePath: string) => string | undefined;
  importsOf: (source: string) => readonly string[];
}> =>
  ({
    readSource: memoizeFunction(read, (file: string) => file),
    importsOf: memoizeFunction(preProcessImports, (source) => source),
  }) as const;

/** The text of a file by its path from the repository root, or `undefined`. */
export const readSource = (relativePath: string): string | undefined => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.readFileSync(path.resolve(projectRootPath, relativePath), 'utf8');
  } catch {
    return undefined;
  }
};

/** Every workspace library, by package name, to its directory from the root. */
export const readWorkspacePackages = async (): Promise<
  Result<ReadonlyMap<string, string>, string>
> =>
  Result.safeTry(async function* () {
    const directories = yield* Result.safeUnwrap(await listLibraryDirs());

    const mut_packages = new Map<string, string>();

    for (const directory of directories) {
      const relativeDirectory = path.relative(projectRootPath, directory);

      const manifest = yield* Result.safeUnwrap(
        await readRepositoryFile(`${relativeDirectory}/package.json`),
      );

      const parsed: unknown = JSON.parse(manifest);

      const name =
        isNonNullObject(parsed) && isRecord(parsed) && hasKey(parsed, 'name')
          ? parsed.name
          : undefined;

      if (typeof name === 'string') {
        mut_packages.set(name, relativeDirectory);
      }
    }

    return Result.ok(mut_packages);
  });

/** What `walkImports` reached from one entry. */
export type Closure = Readonly<{
  files: readonly string[];
  unfollowed: readonly string[];
  /** Every bare specifier naming a workspace package, as written. */
  workspaceImports: readonly string[];
}>;

/** A package's source entry, in the order `CLAUDE.md` names them. */
const PACKAGE_ENTRIES = ['entry-point.mts', 'index.mts'] as const;

/**
 * The specifiers a module's text imports, as TypeScript's preprocessor reads
 * them, so type-only ones too: static imports and re-exports, and `import()`
 * and `require()` of a string literal, but not a call seen through a wrapper
 * (`(require)!('./x.mjs')`), which nothing in the repository writes.
 */
const preProcessImports = (source: string): readonly string[] =>
  ts
    .preProcessFile(source, true, true)
    .importedFiles.map(({ fileName }) => fileName);

const toPackageName = (specifier: string): string => {
  const segments = specifier.split('/');

  return specifier.startsWith('@')
    ? Arr.take(segments, 2).join('/')
    : (segments[0] ?? specifier);
};
