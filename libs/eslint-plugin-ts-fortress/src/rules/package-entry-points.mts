import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, isRecord } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import type * as ts from 'typescript';

/**
 * The source files behind what the `package.json` nearest to `fileName`
 * publishes — `exports`, and the legacy `main` / `module` / `types` /
 * `typings` fields — as file names of `program`.
 *
 * A target that is a file of the program is taken as it is. One that is not
 * — the usual case, `./dist/index.mjs` — is traced back to source: the
 * output extension is dropped, a leading `dist`, `lib`, `build`, `out`, `esm`
 * or `cjs` directory (or the program's `outDir`) becomes `src` (or its
 * `rootDir`), and every TypeScript and JavaScript extension is tried.
 * Conditions of one subpath describe the same module, so a subpath is
 * resolved when any of its targets is; `types: './dist/types.d.mts'` written
 * by a build step need not have a source of its own.
 *
 * `undefined` when some subpath resolves to no file of the program: the
 * package's public surface is then not known, and the caller must not treat
 * an export as private. A directory with no `package.json` above it, or one
 * that publishes nothing, has no entry points — an application.
 */
export const packageEntryPoints = (
  program: ts.Program,
  fileName: string,
): ReadonlySet<string> | undefined => {
  const packageJsonPath = findPackageJson(path.dirname(fileName));

  if (packageJsonPath === undefined) {
    return new Set();
  }

  const mut_cache = mut_cacheOf(program);

  if (mut_cache.has(packageJsonPath)) {
    return mut_cache.get(packageJsonPath);
  }

  const result = resolvePackage(program, packageJsonPath);

  mut_cache.set(packageJsonPath, result);

  return result;
};

/**
 * Keyed by the program, so that the files one program lints share one reading
 * of each `package.json`, and an edit that yields a new program reads it again.
 */
const mut_entryPointsCache = new WeakMap<
  ts.Program,
  Map<string, ReadonlySet<string> | undefined>
>();

/** The legacy fields that name the `.` subpath alongside `exports`. */
const LEGACY_ENTRY_FIELDS = ['main', 'module', 'types', 'typings'] as const;

/** Directories a build conventionally writes to, traced back to `src`. */
const OUTPUT_DIRECTORIES = new Set([
  'dist',
  'lib',
  'build',
  'out',
  'esm',
  'cjs',
]);

/** Output extensions, longest first so `.d.mts` is not read as `.mts`. */
const OUTPUT_EXTENSION_PATTERN =
  /\.(?:d\.mts|d\.cts|d\.ts|mjs|cjs|js|jsx|mts|cts|ts|tsx)$/u;

const SOURCE_EXTENSIONS = [
  '.mts',
  '.ts',
  '.tsx',
  '.cts',
  '.mjs',
  '.js',
  '.jsx',
  '.cjs',
  '.d.mts',
  '.d.ts',
  '.d.cts',
] as const;

const mut_cacheOf = (
  program: ts.Program,
): Map<string, ReadonlySet<string> | undefined> => {
  const cached = mut_entryPointsCache.get(program);

  if (cached !== undefined) {
    return cached;
  }

  const mut_created = new Map<string, ReadonlySet<string> | undefined>();

  mut_entryPointsCache.set(program, mut_created);

  return mut_created;
};

const findPackageJson = (directory: string): string | undefined => {
  const candidate = path.join(directory, 'package.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (fs.existsSync(candidate)) {
    return candidate;
  }

  const parent = path.dirname(directory);

  return parent === directory ? undefined : findPackageJson(parent);
};

const resolvePackage = (
  program: ts.Program,
  packageJsonPath: string,
): ReadonlySet<string> | undefined => {
  const manifest = readJson(packageJsonPath);

  if (!isRecord(manifest)) {
    return undefined;
  }

  const packageDirectory = path.dirname(packageJsonPath);

  const mut_files = new Set<string>();

  for (const targets of subpathTargets(manifest)) {
    const resolved = targets.flatMap((target) =>
      resolveTarget(program, packageDirectory, target),
    );

    if (Arr.isEmpty(resolved)) {
      return undefined;
    }

    for (const file of resolved) {
      mut_files.add(file);
    }
  }

  return mut_files;
};

const readJson = (filePath: string): unknown => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return undefined;
  }
};

/**
 * The code targets of each subpath the manifest publishes, one list per
 * subpath. Targets that are not code (`./package.json`, a stylesheet) are
 * left out, and a subpath left with none is dropped.
 */
const subpathTargets = (
  manifest: ReadonlyRecord<string, unknown>,
): readonly (readonly string[])[] => {
  const legacyTargets = LEGACY_ENTRY_FIELDS.flatMap((field) => {
    const value = manifest[field];

    return typeof value === 'string' ? [value] : [];
  });

  const exportsField = manifest['exports'];

  const subpaths: readonly (readonly string[])[] =
    isRecord(exportsField) &&
    Object.keys(exportsField).some((key) => key.startsWith('.'))
      ? Object.entries(exportsField).map(([key, value]) => [
          ...leafTargets(value),
          ...(key === '.' ? legacyTargets : []),
        ])
      : ([[...leafTargets(exportsField), ...legacyTargets]] as const);

  return subpaths
    .map((targets) =>
      targets.filter((target) => OUTPUT_EXTENSION_PATTERN.test(target)),
    )
    .filter(Arr.isNonEmpty);
};

/** Every string under a target, through condition objects and fallbacks. */
const leafTargets = (value: unknown): readonly string[] =>
  typeof value === 'string'
    ? ([value] as const)
    : Arr.isArray(value)
      ? value.flatMap(leafTargets)
      : isRecord(value)
        ? Object.values(value).flatMap(leafTargets)
        : ([] as const);

/** The files of the program a target names, directly or as its source. */
const resolveTarget = (
  program: ts.Program,
  packageDirectory: string,
  target: string,
): readonly string[] => {
  const relative = path.normalize(target).replaceAll('\\', '/');

  const candidates = Arr.toUnshifted(relative)(
    sourceCandidates(program, packageDirectory, relative),
  );

  if (!relative.includes('*')) {
    return candidates.flatMap((candidate) => {
      const sourceFile = program.getSourceFile(
        path.resolve(packageDirectory, candidate),
      );

      return sourceFile === undefined ? [] : [sourceFile.fileName];
    });
  }

  const patterns = candidates.map((candidate) =>
    toPosix(path.resolve(packageDirectory, candidate)),
  );

  return program
    .getSourceFiles()
    .map((sourceFile) => sourceFile.fileName)
    .filter((fileName) =>
      patterns.some((pattern) =>
        matchesPattern(toPosix(path.resolve(fileName)), pattern),
      ),
    );
};

/**
 * Where the source of an output path would be: the extension swapped for
 * each source extension, under the output directory and under `src` (or the
 * program's `rootDir`) in its place.
 */
const sourceCandidates = (
  program: ts.Program,
  packageDirectory: string,
  relative: string,
): readonly string[] => {
  const stem = relative.replace(OUTPUT_EXTENSION_PATTERN, '');

  const { outDir, rootDir } = program.getCompilerOptions();

  const outputDirectory =
    outDir === undefined
      ? undefined
      : toPosix(path.relative(packageDirectory, outDir));

  const sourceDirectory =
    rootDir === undefined
      ? 'src'
      : toPosix(path.relative(packageDirectory, rootDir));

  const [first, ...rest] = stem.split('/');

  const stems =
    first !== undefined &&
    (first === outputDirectory || OUTPUT_DIRECTORIES.has(first))
      ? ([stem, Arr.toUnshifted(sourceDirectory)(rest).join('/')] as const)
      : ([stem] as const);

  return stems.flatMap((s) =>
    SOURCE_EXTENSIONS.map((extension) => `${s}${extension}`),
  );
};

const toPosix = (p: string): string => p.replaceAll('\\', '/');

/**
 * Whether a path matches an `exports` pattern, whose one `*` stands for any
 * non-empty string, `/` included. A pattern with more than one `*` is not one
 * Node.js accepts, and matches nothing.
 */
const matchesPattern = (filePath: string, pattern: string): boolean => {
  const parts = pattern.split('*');

  if (!Arr.isFixedLengthArray(2, parts)) {
    return false;
  }

  const [prefix, suffix] = parts;

  return (
    filePath.length > prefix.length + suffix.length &&
    filePath.startsWith(prefix) &&
    filePath.endsWith(suffix)
  );
};
