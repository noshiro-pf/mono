import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isNotUndefined,
  isRecord,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import {
  readsForgottenExports,
  typesEntryPoints,
} from '../lib/forgotten-exports-scope.mjs';
import { pathFromRoot, projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a declaration file a consumer reaches carries a
 * `/// <reference types="…" />` naming a package that the package does not
 * promise them: one that is not in its `dependencies`, nor a peer it requires.
 *
 * `tsc` writes such a directive into an emitted `.d.mts` by itself when an
 * exported declaration's inferred type is one of a types package's (a function
 * returning a `Buffer` gets `/// <reference types="node" />`). In the
 * repository the directive resolves, to the root's `@types/node`, so
 * `check:dist` passes; a consumer without that package, compiling with
 * `skipLibCheck` off, gets TS2688 from inside `node_modules`. The fix is to
 * name the type the declaration means (an explicit return type of the package's
 * own), or to promise the package (`dependencies`, or a peer).
 *
 * A reference to `x` is promised by `x` itself or by its types package
 * (`@types/x`, `@types/scope__name` for `@scope/name`). An optional peer, an
 * optional dependency and a devDependency promise nothing.
 *
 * The files read are those a consumer reaches: each `types` file the package's
 * `exports` name, an `internal` subpath's included, since a consumer can import
 * it as well, and every declaration file of the package those import, by any
 * form (`import`, `export … from`, an `import('…')` type) or reach by a
 * `/// <reference path>`. A file none reaches, such as a command's under
 * `dist/cmd/`, is not read. The packages read are those
 * `check:forgotten-exports` reads (`readsForgottenExports` in
 * `../lib/forgotten-exports-scope.mts`), built: it reads their `dist/`, so it
 * runs beside that check, after `ws:build` in CI, and over the changed packages
 * in `check-changed`.
 *
 * ```sh
 * pnpm run check:dist-type-references                  # every package read
 * pnpm run check:dist-type-references libs/pr-merge-queue
 * ```
 */
export const checkDistTypeReferences = async (
  directories: readonly string[] = [],
): Promise<Result<number, string>> => {
  const packages = await getWorkspacePackages(projectRootPath);

  const read = Arr.generate(function* () {
    for (const pkg of packages) {
      const manifest = isRecord(pkg.packageJson)
        ? pkg.packageJson
        : ({} as const);

      if (
        readsForgottenExports({
          name: pkg.name,
          dir: pathFromRoot(pkg.path, projectRootPath),
          manifest,
        })
      ) {
        yield {
          name: pkg.name,
          path: pkg.path,
          manifest,
          entryPoints: typesEntryPoints(manifest['exports'], {
            internal: true,
          }).map((entry) => path.resolve(pkg.path, entry)),
        } as const;
      }
    }
  });

  const readPaths = new Set<string>(read.map((pkg) => path.resolve(pkg.path)));

  const unread = directories.filter(
    (directory) => !readPaths.has(path.resolve(projectRootPath, directory)),
  );

  if (Arr.isNonEmpty(unread)) {
    return Result.err(
      `${unread.join(', ')}: not a package check:dist-type-references reads (readsForgottenExports in tools/scripts/lib/forgotten-exports-scope.mts says which).`,
    );
  }

  const wanted = new Set<string>(
    directories.map((directory) => path.resolve(projectRootPath, directory)),
  );

  const selected = Arr.isEmpty(directories)
    ? read
    : read.filter((pkg) => wanted.has(path.resolve(pkg.path)));

  const reports = await Promise.all(
    selected.map(async (pkg) => {
      const absent = await filterAsync(pkg.entryPoints, async (file) =>
        fs
          .access(file)
          .then(() => false)
          .catch(() => true),
      );

      if (Arr.isNonEmpty(absent)) {
        return `${pkg.name}: ${absent.map((file) => path.relative(projectRootPath, file)).join(', ')} not built; run \`pnpm run ws:build\`.`;
      }

      const found = await findUndeclaredTypeReferences(
        pkg.entryPoints,
        pkg.path,
        promisedTypePackages(pkg.manifest),
      );

      return Arr.isNonEmpty(found)
        ? Arr.toUnshifted(`${pkg.name}:`)(
            found.map(
              ({ file, reference }) =>
                `  ${path.relative(projectRootPath, file)}: /// <reference types="${reference}" />, which ${pkg.name} does not promise its consumers.`,
            ),
          ).join('\n')
        : undefined;
    }),
  );

  const failures = reports.filter(isNotUndefined);

  return Arr.isNonEmpty(failures)
    ? Result.err(
        [
          ...failures,
          '',
          'A consumer without that package gets TS2688 from inside node_modules.',
          'Give the declaration a type of the package its own (an explicit return',
          'type, say), so that tsc writes no directive, or promise the package:',
          'put it, or its @types package, in `dependencies` or the required peers.',
        ].join('\n'),
      )
    : Result.ok(selected.length);
};

/**
 * The packages a manifest promises its consumers: its `dependencies`, and the
 * `peerDependencies` its `peerDependenciesMeta` does not mark optional.
 */
export const promisedTypePackages = (
  manifest: unknown,
): ReadonlySet<string> => {
  if (!isRecord(manifest)) {
    return new Set<string>();
  }

  const namesOf = (field: string): readonly string[] =>
    hasKey(manifest, field) && isRecord(manifest[field])
      ? Object.keys(manifest[field])
      : ([] as const);

  const meta =
    hasKey(manifest, 'peerDependenciesMeta') &&
    isRecord(manifest.peerDependenciesMeta)
      ? manifest.peerDependenciesMeta
      : ({} as const);

  const isOptionalPeer = (name: string): boolean => {
    const entry = meta[name];

    return (
      isRecord(entry) && hasKey(entry, 'optional') && entry.optional === true
    );
  };

  return new Set<string>([
    ...namesOf('dependencies'),
    ...namesOf('peerDependencies').filter((name) => !isOptionalPeer(name)),
  ]);
};

/**
 * Each `/// <reference types="…" />` naming a package outside `promised`, in
 * the declaration files of the package at `packageDir` that `entryPoints`
 * reach, in the order reached. A file outside the package, or under a
 * `node_modules`, is not read: another package answers for its own.
 */
export const findUndeclaredTypeReferences = async (
  entryPoints: readonly string[],
  packageDir: string,
  promised: ReadonlySet<string>,
): Promise<readonly Readonly<{ file: string; reference: string }>[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package directory of the workspace, or a declaration file it reaches
  const ownDir = `${await fs.realpath(packageDir)}${path.sep}` as const;

  const mut_seen = new Set<string>();

  const mut_queue: string[] = Array.from(entryPoints);

  const mut_found: Readonly<{ file: string; reference: string }>[] = [];

  while (Arr.isNonEmpty(mut_queue)) {
    const file = mut_queue.shift();

    if (file === undefined) {
      break;
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package directory of the workspace, or a declaration file it reaches
    const real = await fs.realpath(file).catch(() => undefined);

    if (
      real === undefined ||
      mut_seen.has(real) ||
      !real.startsWith(ownDir) ||
      real.split(path.sep).includes('node_modules')
    ) {
      continue;
    }

    mut_seen.add(real);

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package directory of the workspace, or a declaration file it reaches
    const text = await fs.readFile(real, 'utf8');

    const { importedFiles, referencedFiles, typeReferenceDirectives } =
      ts.preProcessFile(text, true, true);

    for (const { fileName: reference } of typeReferenceDirectives) {
      if (!isPromised(reference, promised)) {
        mut_found.push({ file: real, reference });
      }
    }

    for (const { fileName } of referencedFiles) {
      mut_queue.push(path.resolve(path.dirname(real), fileName));
    }

    for (const { fileName } of importedFiles) {
      const resolved = ts.resolveModuleName(
        fileName,
        real,
        RESOLUTION_OPTIONS,
        ts.sys,
      ).resolvedModule?.resolvedFileName;

      if (resolved !== undefined) {
        mut_queue.push(resolved);
      }
    }
  }

  return mut_found;
};

const RESOLUTION_OPTIONS: ts.CompilerOptions = {
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  types: [],
} as const;

/** `@types/x` for `x`, `@types/scope__name` for `@scope/name`. */
const typesPackageOf = (name: string): string =>
  `@types/${name.startsWith('@') ? name.slice(1).replace('/', '__') : name}` as const;

/** Whether `reference` is `promised` itself or through its types package. */
const isPromised = (
  reference: string,
  promised: ReadonlySet<string>,
): boolean =>
  promised.has(reference) || promised.has(typesPackageOf(reference));

const filterAsync = async <A,>(
  items: readonly A[],
  predicate: (item: A) => Promise<boolean>,
): Promise<readonly A[]> => {
  const kept = await Promise.all(items.map(predicate));

  return items.filter((_, index) => kept[index] === true);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDistTypeReferences(Arr.skip(process.argv, 2)).catch(
    (error: unknown) => Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(`❌ ${result.value}`);

    process.exit(1);
  }

  console.info(
    `✅ ${result.value} package(s) read: no declaration a consumer reaches references a types package they are not promised.`,
  );
}
