// cspell:ignore libc
import * as esbuild from 'esbuild';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import { findPackageJSON, isBuiltin } from 'node:module';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Arr, isRecord, isString, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { workspaceRootPath } from '../workspace-root-path.mjs';
import { isSubject, libraryOf, packageOf, scenarios } from './scenarios.mjs';

export const readMeasuredInputs = async (): Promise<MeasuredInputs> => {
  const libraries = await resolveLibraries();

  const measuredCode = await digestMeasuredCode(
    repositoryRootPath,
    measuredEntries(),
    UNMEASURED_FILES,
  )
    // esbuild's service would otherwise stay up beside the processes the runner
    // times. Stopped here, after the one digest, rather than in
    // digestMeasuredCode: the service is shared, and stopping it there would
    // fail a digest running beside another.
    .finally(() => esbuild.stop());

  return {
    measuredCode,
    libraries: Object.fromEntries(
      Array.from(libraries, ([name, { version }]) => [name, version] as const),
    ),
    libraryDependencies: await readDependencyClosure(
      Array.from(libraries.values(), ({ manifestPaths }) =>
        Array.from(manifestPaths),
      ).flat(),
    ),
  } as const;
};

/**
 * The installed version of every package the given manifests depend on at run
 * time, transitively, by name: what each lists in `dependencies` or installs of
 * its `optionalDependencies`, `@types/*` aside, where it ships JavaScript and
 * installs on every platform. It follows manifests, not imports, so it also
 * records what the measured entries never load (Solid's server-only `seroval`):
 * a bump there holds a release that need not wait, which costs a measurement
 * and misses nothing.
 */
export const readDependencyClosure = async (
  roots: readonly string[],
): Promise<ReadonlyRecord<string, string>> => {
  const mut_versions = new Map<string, ReadonlySet<string>>();

  const mut_seen = new Set<string>(roots);

  const mut_pending: Manifest[] = await Promise.all(roots.map(readManifest));

  while (Arr.isNonEmpty(mut_pending)) {
    const manifest = mut_pending.pop();

    if (manifest === undefined) {
      break;
    }

    for (const [name, required] of manifest.dependencies) {
      if (name.startsWith('@types/')) {
        continue;
      }

      const resolved = resolveOwnManifest(name, manifest.path);

      if (resolved === undefined) {
        if (required) {
          throw new Error(`${name} does not resolve from ${manifest.path}`);
        }

        continue;
      }

      if (mut_seen.has(resolved)) {
        continue;
      }

      mut_seen.add(resolved);

      const dependency = await readManifest(resolved);

      // A package for some platforms alone, and what it runs on, are installed
      // on some machines only: recording them would tell the runner's record
      // apart from a laptop's where nothing that runs differs.
      if (dependency.platformSpecific) {
        continue;
      }

      mut_pending.push(dependency);

      if (dependency.shipsCode) {
        mut_versions.set(
          name,
          new Set<string>([
            ...(mut_versions.get(name) ?? []),
            dependency.version,
          ]),
        );
      }
    }
  }

  return Object.fromEntries(
    Array.from(mut_versions)
      .toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([name, versions]) => [
        name,
        Array.from(versions).toSorted().join(', '),
      ]),
  );
};

/**
 * A digest of the code the files `entries` run: each entry bundled by esbuild
 * with what it imports from the repository at `root`, tree-shaken, without
 * types, comments, in-source tests (`import.meta.vitest` blocks) and
 * `expectType` calls. A change to what runs changes it; an edited comment, a
 * type, a test, or a function nothing measured calls does not, unless it is a
 * member of a namespace object a measured file uses (ts-data-forge's `Result`,
 * `Arr`), which esbuild keeps whole: an edit there holds a release that need
 * not wait, which costs a measurement and misses nothing. Third-party packages
 * are left out: `readMeasuredInputs` records the versions of the measured
 * libraries and of what they run on, and of no other package the measured code
 * might import. A workspace package is read from its source, the file its
 * `exports` names in `dist/` read from `src/`. A release of esbuild that emits
 * some construct differently changes it too.
 */
export const digestMeasuredCode = async (
  rootPath: string,
  entries: readonly string[],
  unmeasured: ReadonlySet<string>,
): Promise<string> => {
  // Resolved, as the files the resolver returns are, so that a root reached
  // through a symbolic link names each file by the same path.
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository, never from input
  const root = realpathSync(rootPath);

  const relativeTo = (file: string): string =>
    path.relative(root, file).split(path.sep).join('/');

  const entryPaths = entries.map((entry) =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- as above
    realpathSync(entry),
  );

  const digestDir = path.join(root, 'digest');

  // The entry a bundle was built from, for an error to name the file to edit
  // rather than the output esbuild named after it.
  const entryOf = (output: string): string => {
    const stem = path
      .relative(digestDir, output)
      .split(path.sep)
      .join('/')
      .replace(/\.js$/u, '');

    return (
      entryPaths
        .map(relativeTo)
        .find((entry) => entry.replace(/\.[^./]+$/u, '') === stem) ?? stem
    );
  };

  const isUnmeasured = (file: string): boolean => {
    const relative = relativeTo(file);

    return Array.from(unmeasured).some((entry) =>
      entry.endsWith('/') ? relative.startsWith(entry) : relative === entry,
    );
  };

  const { outputFiles } = await esbuild.build({
    entryPoints: entryPaths,
    absWorkingDir: root,
    outbase: root,
    outdir: digestDir,
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    tsconfigRaw: '{}',
    legalComments: 'none',
    define: { 'import.meta.vitest': 'undefined' },
    // Folds the in-source tests' `undefined !== undefined` away with them.
    minifySyntax: true,
    logLevel: 'silent',
    plugins: [
      {
        name: 'measured-code',
        setup: (build) => {
          build.onResolve(
            // eslint-disable-next-line require-unicode-regexp -- esbuild compiles a filter as a Go regular expression, which takes no flags
            { filter: /.*/ },
            ({ path: specifier, importer }) => {
              const resolved = resolveImport(specifier, importer, root);

              return resolved === undefined || isUnmeasured(resolved)
                ? { path: specifier, external: true }
                : { path: resolved };
            },
          );

          build.onLoad(
            // eslint-disable-next-line require-unicode-regexp -- as above
            { filter: /\.(?:[cm]?[jt]sx?|json)$/ },
            async ({ path: file }) => {
              // `expectType` does nothing at run time, but esbuild cannot tell,
              // so its calls would stay in the bundle; declared free of side
              // effects, they go.
              if (relativeTo(file) === EXPECT_TYPE_SOURCE) {
                return {
                  contents:
                    '/* @__NO_SIDE_EFFECTS__ */ export function expectType() {}',
                  loader: 'js',
                };
              }

              // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
              const contents = await fs.readFile(file, 'utf8');

              if (/^export (?:const|function) expectType\b/mu.test(contents)) {
                throw new Error(
                  `${relativeTo(file)} declares expectType; update EXPECT_TYPE_SOURCE in measured-inputs.mts`,
                );
              }

              // Line endings are made LF, so that a checkout that converts them
              // (`core.autocrlf`) digests the same: esbuild keeps a CRLF inside
              // a JSX attribute.
              return {
                contents: contents.replaceAll('\r\n', '\n'),
                loader: loaderOf(file),
              };
            },
          );
        },
      },
    ],
  });

  // Not esbuild's version: a release that bundles the code differently changes
  // the text, and one that does not changes nothing measured.
  const mut_hash = createHash('sha256');

  const outputs = outputFiles
    .map(({ path: file, text }) => [file, text] as const)
    .toSorted(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  for (const [file, text] of outputs) {
    // A module that is only loaded lazily is wrapped by esbuild's `__esm`
    // helper, and esbuild orders the calls that load it differently from one
    // run to the next. A dynamic `import()` does it, and so do a `require()` of
    // an ES module and a cycle between an ES module and a CommonJS one.
    // Matched at a line start, as esbuild emits the helper, not inside a string.
    if (/^var __esm = /mu.test(text)) {
      throw new Error(
        `${entryOf(file)} loads code of the repository lazily (a dynamic \`import()\`, a \`require()\` of an ES module, or a cycle between an ES module and a CommonJS one): import it statically. Only code no measured process times (the runner's own tooling) may instead join the files the digest leaves out; for timed code, such as a library's, teach digestMeasuredCode in measured-inputs.mts to read the lazy form`,
      );
    }

    // Bundled, each module is introduced by a comment naming its path, so
    // moving code from one file to another counts.
    mut_hash.update(`${relativeTo(file)}\0${text}\0`);
  }

  return mut_hash.digest('hex').slice(0, 16);
};

/**
 * What a measurement depends on, recorded beside its figures so that a table
 * older than the code it describes can be told apart from a current one:
 * `check:prose:synstate-benchmark-fresh` holds a release of synstate until both
 * match the tree again.
 */
export type MeasuredInputs = Readonly<{
  /** `digestMeasuredCode`'s digest of the code the scenarios run. */
  measuredCode: string;
  /** The installed versions of the other libraries, by package name. */
  libraries: ReadonlyRecord<string, string>;
  /**
   * The installed versions of what those libraries run on in turn (Redux
   * Toolkit's Immer, Valtio's proxy-compare), by package name, each name's
   * versions joined by `, ` where two are installed. A lockfile refresh moves
   * them without moving a library's own version.
   */
  libraryDependencies: ReadonlyRecord<string, string>;
}>;

type Manifest = Readonly<{
  path: string;
  version: string;
  /** Each with whether it must be installed (not an optional dependency). */
  dependencies: readonly (readonly [name: string, required: boolean])[];
  /** Whether it ships JavaScript, unlike a package of types alone. */
  shipsCode: boolean;
  /**
   * Whether it names an `os`, a `cpu` or a `libc` to install on, as an optional
   * native binding does: installed on some machines only.
   */
  platformSpecific: boolean;
}>;

/**
 * What the runner imports that no measured process times, from the repository
 * root, an entry ending in `/` naming a directory: this module, loaded to
 * record what was measured, the schema of the file the runner writes, and the
 * repository tooling that formats and writes it.
 */
const UNMEASURED_FILES: ReadonlySet<string> = new Set<string>([
  'apps/synstate-docs/scripts/benchmark/measured-inputs.mts',
  'apps/synstate-docs/scripts/benchmark/results.mts',
  'tools/',
]);

/** The `exports` conditions an `import` under Node.js matches by default. */
const IMPORT_CONDITIONS: ReadonlySet<string> = new Set<string>([
  'node',
  'import',
  'node-addons',
  'module-sync',
  'default',
]);

/** Where `expectType`, which ts-data-forge re-exports, is declared. */
const EXPECT_TYPE_SOURCE = 'libs/ts-std-forge/src/expect-type.mts';

/**
 * The values of `os` and `cpu` of the machines this repository is worked on,
 * the runner included. A package that leaves any of them out is installed on
 * some of them only; one that leaves out only others (`"os": ["!win32"]`) is
 * installed on all of them.
 */
const COMMON_PLATFORMS = [
  ['os', ['linux', 'darwin']],
  ['cpu', ['x64', 'arm64']],
] as const;

const repositoryRootPath = path.resolve(workspaceRootPath, '../..');

/**
 * The files a measurement starts from: the runner, which each measuring process
 * runs, and every scenario's code.
 */
// Not the build: synstate is measured from `dist/`, which its build config, the
// strip pass and the TypeScript version shape too; nor what decides which files
// load beyond `exports` (the `paths` of `tools/configs/tsconfig.tsx.json` the
// processes run under), nor the other `compilerOptions` there and the tsx and
// esbuild that compile the timed scenario code with them. A change there that
// moves the figures without changing any source the entries reach goes
// unnoticed.
const measuredEntries = (): readonly string[] =>
  Arr.toUnshifted(
    path.resolve(workspaceRootPath, 'scripts/benchmark/run-benchmark.mts'),
  )(scenarios.flatMap(({ entries }) => entries.map(({ file }) => file)));

/**
 * The file an `exports` entry names for Node.js's `import`: the first of its
 * conditions, in their order, that such an import matches, read in turn, and
 * the first entry of a fallback array that resolves.
 */
const targetOf = (entry: unknown): string | undefined => {
  if (isString(entry)) {
    return entry;
  }

  // A fallback array: the first of its entries that resolves, as in Node.js,
  // where a `null` among them stops at "not exported".
  if (Arr.isArray(entry)) {
    for (const fallback of entry) {
      if (fallback === null) {
        return undefined;
      }

      const target = targetOf(fallback);

      if (target !== undefined) {
        return target;
      }
    }

    return undefined;
  }

  if (!isRecord(entry)) {
    return undefined;
  }

  // A matching condition whose nested conditions match none falls through to
  // the next, as in Node.js; `null` stops at "not exported", read as none.
  for (const [key, value] of Object.entries(entry)) {
    if (!IMPORT_CONDITIONS.has(key)) {
      continue;
    }

    const target = value === null ? null : targetOf(value);

    if (target !== undefined) {
      return target ?? undefined;
    }
  }

  return undefined;
};

/**
 * The file `exports[subpath]` of the manifest at `manifestPath` names for an
 * `import` (`targetOf`); `undefined` for a form it does not read (a pattern
 * such as `./*`), which fails the digest.
 */
const exportedFile = (
  manifestPath: string,
  subpath: string,
): string | undefined => {
  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
    readFileSync(manifestPath, 'utf8'),
  );

  const exportMap = isRecord(manifest) ? manifest['exports'] : undefined;

  // `"exports": "./x"` and a map of conditions alone are the `.` subpath's.
  const entry =
    isRecord(exportMap) &&
    Object.keys(exportMap).some((key) => key.startsWith('.'))
      ? exportMap[subpath]
      : subpath === '.'
        ? exportMap
        : undefined;

  return targetOf(entry);
};

/**
 * `file` itself when it is there as named, and otherwise the source of the
 * JavaScript file it names (`.mts` for `.mjs`, and so on).
 */
const sourceOf = (file: string, from: string): string => {
  // The named file first, as tsx loads it when it is there.
  const candidates = [
    file,
    file.replace(/\.([cm]?)js$/u, '.$1ts'),
    file.replace(/\.([cm]?)js$/u, '.$1tsx'),
    file.replace(/\.jsx$/u, '.tsx'),
  ] as const;

  // A file, not a directory of that name, which esbuild would then fail on with
  // its own message.
  const found = candidates.find(
    (candidate) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
      statSync(candidate, { throwIfNoEntry: false })?.isFile() === true,
  );

  if (found === undefined) {
    throw new Error(`${file}, imported by ${from}, is not there`);
  }

  return found;
};

/**
 * The manifest `name` resolves to from the file `from`, by its real path: pnpm
 * links each package's own dependencies beside the real directory, not beside
 * the link the importer sees.
 */
const resolveManifest = (name: string, from: string): string | undefined => {
  const resolved = Result.fromThrowable(() =>
    findPackageJSON(name, pathToFileURL(from)),
  );

  return Result.isErr(resolved) || resolved.value === undefined
    ? undefined
    : // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
      realpathSync(resolved.value);
};

/**
 * The file an import `specifier` in `from` loads, when it is one of the
 * repository's: a relative or absolute import, as the source file beside the
 * `.mjs` it names, or an import of a workspace package, as the source of the
 * file its `exports` names. `undefined` for a built-in or third-party module,
 * one installed under `node_modules` below `root`, a real path. A file that
 * should be there and is not fails, so that code moved away is not left
 * measured by nothing.
 */
const resolveImport = (
  specifier: string,
  from: string,
  root: string,
): string | undefined => {
  if (specifier.startsWith('.') || path.isAbsolute(specifier)) {
    return sourceOf(path.resolve(path.dirname(from), specifier), from);
  }

  if (isBuiltin(specifier)) {
    return undefined;
  }

  if (specifier.startsWith('node:')) {
    throw new Error(
      `${specifier}, imported by ${from}, is no built-in module of Node.js ${process.version}`,
    );
  }

  if (specifier.startsWith('#')) {
    throw new Error(
      `${specifier}, imported by ${from}, is a subpath import, which the digest does not follow; teach resolveImport in measured-inputs.mts`,
    );
  }

  const segments = specifier.split('/');

  const nameLength = specifier.startsWith('@') ? 2 : 1;

  const name = segments.slice(0, nameLength).join('/');

  const manifestPath = resolveManifest(name, from);

  // The runner's `tsconfig.tsx.json` maps some workspace packages by `paths`,
  // so one the importer does not declare would still load there.
  if (manifestPath === undefined) {
    throw new Error(
      `${name}, imported by ${from}, does not resolve; declare it in the importer's package.json`,
    );
  }

  // Read below the project root, so that a clone inside a directory named
  // `node_modules` does not make every package third-party.
  if (
    path.relative(root, manifestPath).split(path.sep).includes('node_modules')
  ) {
    return undefined;
  }

  const subpath = Arr.toUnshifted('.')(segments.slice(nameLength)).join('/');

  const target = exportedFile(manifestPath, subpath);

  if (target === undefined) {
    throw new Error(
      `${specifier}, imported by ${from}, names no export of ${path.relative(root, manifestPath)}, which the digest reads from \`exports\` alone; give the package an \`exports\` map that names it`,
    );
  }

  return sourceOf(
    path.resolve(
      path.dirname(manifestPath),
      target.replace(/^\.\/dist\//u, 'src/'),
    ),
    from,
  );
};

/**
 * The manifest of `name` as installed for the package at `manifestPath` itself:
 * inside it, as a dependency it bundles (`bundleDependencies`) is, or linked
 * beside it, as pnpm links what it installs for a package. Node.js would also
 * find a copy hoisted into `.pnpm/node_modules` for some other package, which
 * an optional dependency nobody installed for this one would resolve to.
 */
// Such a hoisted copy, when the library does load it, goes unrecorded: what
// another package installs is no input of the measurement, and recording it
// would let any change elsewhere in the workspace hold a release.
const resolveOwnManifest = (
  name: string,
  manifestPath: string,
): string | undefined => {
  const segments = path.dirname(manifestPath).split(path.sep);

  const nodeModules = segments.lastIndexOf('node_modules');

  const inside = path.join(
    path.dirname(manifestPath),
    'node_modules',
    name,
    'package.json',
  );

  const beside =
    nodeModules === -1
      ? ([] as const)
      : ([
          path.join(
            segments.slice(0, nodeModules + 1).join(path.sep),
            name,
            'package.json',
          ),
        ] as const);

  const found = Arr.toUnshifted(inside)(beside).find(existsSync);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
  return found === undefined ? undefined : realpathSync(found);
};

/**
 * Whether a manifest's `os` or `cpu` list `field` admits `value`: no list, a
 * list naming it, or a list of exclusions alone (`"!win32"`) not excluding it.
 */
const installsOn = (field: unknown, value: string): boolean => {
  if (!Arr.isArray(field)) {
    return true;
  }

  const entries = field.filter(isString);

  return entries.every((entry) => entry.startsWith('!'))
    ? !entries.includes(`!${value}`)
    : entries.includes(value);
};

/** Whether a manifest's `libc` list names one, which only some Linux have. */
const namesAny = (field: unknown): boolean =>
  Arr.isArray(field) &&
  field.some((entry) => isString(entry) && !entry.startsWith('!'));

/** The esbuild loader of a file the digest reads, by its extension. */
const loaderOf = (file: string): esbuild.Loader =>
  file.endsWith('.json')
    ? 'json'
    : /\.[cm]?js$/u.test(file)
      ? 'js'
      : file.endsWith('.jsx')
        ? 'jsx'
        : file.endsWith('x')
          ? 'tsx'
          : 'ts';

/**
 * Whether an `exports` value names a JavaScript file, or a file with no
 * extension (`"./*": "./lib/*"`), which may be one.
 */
const exportsCode = (value: unknown): boolean =>
  isString(value)
    ? /\.[cm]?js$/u.test(value) || !/\.[^/]*$/u.test(value)
    : Arr.isArray(value)
      ? value.some(exportsCode)
      : isRecord(value) &&
        Object.entries(value).some(
          ([key, entry]) => key !== 'types' && exportsCode(entry),
        );

/**
 * A manifest's version, the packages it runs on (`dependencies`, and
 * `optionalDependencies`, which may be missing), and what decides whether its
 * version is recorded.
 */
// Peers are left out: the scenarios import each library's framework-free entry,
// so a peer such as React is declared but not what runs. Nothing checks that
// they do yet (#4440): an import of an entry that loads a peer (`jotai` rather
// than `jotai/vanilla`) leaves that peer's version unrecorded.
const readManifest = async (manifestPath: string): Promise<Manifest> => {
  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
    await fs.readFile(manifestPath, 'utf8'),
  );

  if (!isRecord(manifest) || !isString(manifest['version'])) {
    throw new Error(`no version in ${manifestPath}`);
  }

  const namesIn = (field: string): readonly string[] => {
    const value = manifest[field];

    return isRecord(value) ? Object.keys(value) : [];
  };

  const optional = new Set<string>(namesIn('optionalDependencies'));

  const declaresEntry = (field: string): boolean =>
    manifest[field] !== undefined && manifest[field] !== '';

  return {
    path: manifestPath,
    version: manifest['version'],
    dependencies: [
      ...namesIn('dependencies')
        .filter((name) => !optional.has(name))
        .map((name) => [name, true] as const),
      ...Array.from(optional, (name) => [name, false] as const),
    ],
    // An `exports` is all Node.js reads when there is one; without it, a package
    // of types alone (csstype) declares `types` and no entry, nor the `index.js`
    // Node.js would load without one.
    shipsCode:
      manifest['exports'] === undefined
        ? declaresEntry('main') ||
          declaresEntry('module') ||
          !(declaresEntry('types') || declaresEntry('typings')) ||
          // eslint-disable-next-line security/detect-non-literal-fs-filename -- the path comes from the repository or a manifest in it, never from input
          existsSync(path.join(path.dirname(manifestPath), 'index.js'))
        : exportsCode(manifest['exports']),
    platformSpecific:
      COMMON_PLATFORMS.some(([field, values]) =>
        values.some((value) => !installsOn(manifest[field], value)),
      ) || namesAny(manifest['libc']),
  };
};

/**
 * Each library the scenarios measure, resolved from the file that imports it,
 * as Node.js resolves that import. The scenario files resolve theirs from
 * `libs/synstate`, so a library installed at two versions there fails rather
 * than leave the page naming one of them.
 */
const resolveLibraries = async (): Promise<
  ReadonlyMap<
    string,
    Readonly<{ version: string; manifestPaths: ReadonlySet<string> }>
  >
> => {
  const mut_libraries = new Map<
    string,
    Readonly<{ version: string; manifestPaths: ReadonlySet<string> }>
  >();

  // About fifty lookups: not worth a cache.
  for (const { entries } of scenarios) {
    for (const { label, file } of entries) {
      if (isSubject(label)) {
        continue;
      }

      const name = packageOf[libraryOf(label)];

      if (name === undefined) {
        throw new Error(`no package for ${libraryOf(label)} in \`packageOf\``);
      }

      const manifestPath = resolveManifest(name, file);

      if (manifestPath === undefined) {
        throw new Error(
          `${name} does not resolve from ${file}; install it where that file can import it`,
        );
      }

      const { version } = await readManifest(manifestPath);

      const known = mut_libraries.get(name);

      if (known !== undefined && known.version !== version) {
        throw new Error(
          `${name} is installed at ${known.version} for one scenario and at ${version} for ${file}; align them`,
        );
      }

      // Every copy, since pnpm installs one per set of peers, each with its own
      // links to what it runs on.
      mut_libraries.set(name, {
        version,
        manifestPaths: new Set<string>([
          ...(known?.manifestPaths ?? []),
          manifestPath,
        ]),
      });
    }
  }

  return mut_libraries;
};
