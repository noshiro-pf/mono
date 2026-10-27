import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// A top-level `import type`, not the inline `import { type … }` the lint
// prefers: Node erases the former and keeps the latter as a bare
// `import {} from 'ts-type-forge'`, which fails to resolve before
// `ws:build`. The test's runtime-import check guards this.
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Fails, before a check starts, when a workspace sibling it resolves through
 * `node_modules` has not been built, and says to run `pnpm run ws:build:deps`.
 *
 * ```sh
 * node ../../tools/scripts/cmd/assert-deps-built.mts       # the package in cwd
 * node ./tools/scripts/cmd/assert-deps-built.mts --workspace  # every member
 * ```
 *
 * Without it a missing `dist/` surfaces as `TS2307: Cannot find module`
 * buried among the implicit-`any` errors it causes, or as a Vite "Failed to
 * resolve entry", none of which says that a build is what is missing.
 *
 * **Nothing here lists which commands or packages need `dist/`**; that would
 * go stale the day a package gains a dependency. What a check needs is read
 * off the dependency graph: every package linked into the package's
 * `node_modules` from inside the repository (any of `dependencies`,
 * `peerDependencies`, `devDependencies`), and from there, transitively, what
 * those link through `dependencies` and `peerDependencies` — the fields a
 * consumer sees. For each one, every file its `exports`, `main`, `module` and
 * `types` name has to exist. A package that exports its sources
 * (`"exports": "./src/index.mts"`) passes with no build, and a script run
 * by `tsx --tsconfig tools/configs/tsconfig.tsx.json`, which resolves our
 * packages to their sources, does not need this at all.
 *
 * The answer is for the package, not for one tool: a `check:types` that never
 * loads the `eslint-config-typed` its lint config imports is still asked to
 * have it built. `ws:build` is the state every check is meant to run in, so
 * that costs nothing but the build. (`--root <dir>` replaces the repository
 * root, for the test.)
 *
 * Only presence is checked. A stale `dist/` resolves and behaves like the old
 * source, which this does not notice.
 *
 * **Run with `node`, not `tsx`**: it is the first thing many package scripts
 * run, so it costs one Node startup, and it runs exactly when the packages
 * `tsx` would import from may not be built. Hence `node:*` imports only and
 * erasable syntax only. `check:root:deps-built-guard` keeps the scripts that
 * need it wired to it.
 */
export const main = (argv: readonly string[]): void => {
  const rootIndex = argv.indexOf('--root');

  const rootDir =
    rootIndex === -1
      ? path.resolve(import.meta.dirname, '../../..')
      : path.resolve(argv[rootIndex + 1] ?? '.');

  const startDirs = argv.includes('--workspace')
    ? workspaceStartDirs(rootDir)
    : ([process.cwd()] as const);

  const missing = findMissingBuilds(rootDir, startDirs);

  // eslint-disable-next-line ts-data-forge/prefer-canonical-length-guard -- ts-data-forge is not built when this runs (see the header).
  if (missing.length === 0) {
    return;
  }

  console.error(formatMissingBuilds(rootDir, missing));

  process.exit(1);
};

/**
 * Every package whose build output a check started in one of `startDirs`
 * would resolve and does not find, in the order they are first reached.
 */
export const findMissingBuilds = (
  rootDir: string,
  startDirs: readonly string[],
): readonly MissingBuild[] =>
  findLinkedPackages(rootDir, startDirs)
    .map(({ packageDir, neededBy }) => ({
      packageDir,
      neededBy,
      missing: entryPointTargets(readManifest(packageDir))
        .map(path.normalize)
        .filter(
          (target) =>
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            !fs.existsSync(path.resolve(packageDir, target)),
        ),
    }))
    // eslint-disable-next-line ts-data-forge/prefer-canonical-length-guard -- ts-data-forge is not built when this runs (see the header).
    .filter(({ missing }) => missing.length > 0);

/**
 * Every package of the repository a check started in one of `startDirs`
 * would resolve through `node_modules`, built or not, in the order they are
 * first reached. `ws:build:deps` builds exactly these, so that this guard
 * passes everywhere `--workspace` would run it.
 */
export const findLinkedPackages = (
  rootDir: string,
  startDirs: readonly string[],
): readonly LinkedPackage[] => {
  const mut_checked = new Set<string>();

  const mut_result: LinkedPackage[] = [];

  // Level by level, so that `neededBy` names the nearest package that needs it.
  let mut_frontier: readonly Edge[] = startDirs.flatMap((startDir) =>
    edgesFrom(rootDir, startDir, [
      'dependencies',
      'peerDependencies',
      'devDependencies',
    ]),
  );

  // eslint-disable-next-line ts-data-forge/prefer-canonical-length-guard -- ts-data-forge is not built when this runs (see the header).
  while (mut_frontier.length > 0) {
    const mut_next: Edge[] = [];

    for (const { packageDir, neededBy } of mut_frontier) {
      if (mut_checked.has(packageDir)) {
        continue;
      }

      mut_checked.add(packageDir);

      mut_result.push({
        packageDir,
        packageName: packageName(packageDir, readManifest(packageDir)),
        neededBy,
      });

      mut_next.push(
        ...edgesFrom(rootDir, packageDir, ['dependencies', 'peerDependencies']),
      );
    }

    mut_frontier = mut_next;
  }

  return mut_result;
};

/**
 * Where `--workspace` starts: the root and every member the root
 * `package.json`'s `workspaces` names — the same list `pnpm-workspace.yaml`
 * holds, in a file Node can read without a YAML parser.
 */
export const workspaceStartDirs = (rootDir: string): readonly string[] =>
  // eslint-disable-next-line ts-data-forge/prefer-canonical-array-slicing -- ts-data-forge is not built when this runs (see the header).
  [rootDir, ...workspaceMembers(rootDir)] as const;

/**
 * The files an import of the package can resolve to, as written in its
 * manifest. Subpath patterns (`./*`) are skipped: what they match is not
 * known without the importer.
 */
export const entryPointTargets = (manifest: unknown): readonly string[] => {
  if (!isRecord(manifest)) {
    return [];
  }

  const targets = [
    manifest['main'],
    manifest['module'],
    manifest['types'],
    ...exportTargets(manifest['exports']),
  ].filter(
    (target): target is string =>
      typeof target === 'string' && !target.includes('*'),
  );

  // eslint-disable-next-line ts-data-forge/prefer-arr-uniq -- ts-data-forge is not built when this runs (see the header).
  return Array.from(new Set(targets));
};

export const formatMissingBuilds = (
  rootDir: string,
  missing: readonly MissingBuild[],
): string =>
  [
    'Build output is missing:',
    ...missing.map(
      (m) =>
        `  ${path.relative(rootDir, m.packageDir)} (needed by ${m.neededBy}): ${m.missing.join(', ')}`,
    ),
    'Run `pnpm run ws:build:deps` (or `ws:build`) first.',
  ].join('\n');

export type LinkedPackage = Readonly<{
  packageDir: string;
  packageName: string;
  /** The package through which the check reaches this one. */
  neededBy: string;
}>;

export type MissingBuild = Readonly<{
  packageDir: string;
  /** The package through which the check reaches this one. */
  neededBy: string;
  /** Paths relative to `packageDir`. */
  missing: readonly string[];
}>;

type DependencyField = 'dependencies' | 'peerDependencies' | 'devDependencies';

type Edge = Readonly<{ packageDir: string; neededBy: string }>;

const exportTargets = (value: unknown): readonly unknown[] =>
  typeof value === 'string'
    ? ([value] as const)
    : isRecord(value)
      ? Object.values(value).flatMap(exportTargets)
      : ([] as const);

/** The siblings `packageDir` links to through `fields`, each needed by it. */
const edgesFrom = (
  rootDir: string,
  packageDir: string,
  fields: readonly DependencyField[],
): readonly Edge[] => {
  const manifest = readManifest(packageDir);

  const neededBy = packageName(packageDir, manifest);

  return linkedSiblings(rootDir, packageDir, manifest, fields).map((dep) => ({
    packageDir: dep,
    neededBy,
  }));
};

/**
 * The repository's own packages that `packageDir` links to through `fields`,
 * by where pnpm's symlink points. A third-party package resolves into
 * `node_modules/.pnpm`, and a dependency that is not linked at all is the
 * install's to report, not this.
 */
const linkedSiblings = (
  rootDir: string,
  packageDir: string,
  manifest: unknown,
  fields: readonly DependencyField[],
): readonly string[] => {
  if (!isRecord(manifest)) {
    return [];
  }

  const names = new Set(
    fields.flatMap((field) => {
      const deps = manifest[field];

      return isRecord(deps) ? Object.keys(deps) : [];
    }),
  );

  return Array.from(names).flatMap((name) => {
    const realPath = realpathOrUndefined(
      path.join(packageDir, 'node_modules', name),
    );

    if (realPath === undefined) {
      return [];
    }

    const relative = path.relative(rootDir, realPath);

    return relative.startsWith('..') ||
      relative.split(path.sep).includes('node_modules')
      ? []
      : [realPath];
  });
};

/** The members `workspaces` in the root `package.json` names. */
const workspaceMembers = (rootDir: string): readonly string[] => {
  const manifest = readManifest(rootDir);

  const patterns = isRecord(manifest) ? manifest['workspaces'] : undefined;

  // eslint-disable-next-line ts-data-forge/prefer-arr-is-array -- ts-data-forge is not built when this runs (see the header).
  if (!Array.isArray(patterns)) {
    return [];
  }

  return patterns
    .filter((pattern): pattern is string => typeof pattern === 'string')
    .flatMap((pattern) => fs.globSync(pattern, { cwd: rootDir }))
    .map((dir) => path.resolve(rootDir, dir))
    .filter((dir) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.existsSync(path.join(dir, 'package.json')),
    );
};

const packageName = (packageDir: string, manifest: unknown): string =>
  isRecord(manifest) && typeof manifest['name'] === 'string'
    ? manifest['name']
    : path.basename(packageDir);

const readManifest = (packageDir: string): unknown => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = fs.readFileSync(
      path.join(packageDir, 'package.json'),
      'utf8',
    );

    return JSON.parse(content);
  } catch {
    return undefined;
  }
};

const realpathOrUndefined = (p: string): string | undefined => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.realpathSync(p);
  } catch {
    return undefined;
  }
};

const isRecord = (value: unknown): value is ReadonlyRecord<string, unknown> =>
  // eslint-disable-next-line ts-data-forge/prefer-is-non-null-object -- ts-data-forge is not built when this runs (see the header).
  typeof value === 'object' && value !== null;

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: that package may not be
 * built when this runs (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  main(process.argv);
}
