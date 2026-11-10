import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// A top-level `import type`, not the inline `import { type … }`: Node erases
// the former and keeps the latter as a bare import, which fails to resolve
// before `pnpm install`. `check:root:node-run-scripts` guards this.
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * Chooses which parts of a Firebase project to deploy: the `--only` list of the
 * targets whose files differ between two commits.
 *
 * ```sh
 * TARGETS='[…]' BASE=<sha> HEAD=<sha> node ./tools/scripts/cmd/firebase-deploy-plan.mts
 * ```
 *
 * The `plan` job of `deploy-event-schedule-app.yml` runs it, and appends
 * `only=<target>,…` to `$GITHUB_OUTPUT`, with `pathspecs=`, a JSON object
 * giving each chosen target the `git diff` pathspecs it was chosen by, so that
 * the deploy job can tell with `git` alone whether `main` has changed them
 * since. An empty `BASE` (nothing deployed yet) chooses every target.
 *
 * `TARGETS` is a JSON array of `{ "only": <target>, "packages"?: [<dir>…],
 * "paths"?: [<path>…] }`. A target is chosen when anything it reads differs:
 *
 * - **`paths`**, as they are: configuration such as `firebase.json` or the
 *   Firestore rules.
 * - **`packages`**: each directory, and the directory of every workspace
 *   package it reaches through `dependencies`, `peerDependencies` and
 *   `optionalDependencies` (`workspace:` ranges). These are what a build can
 *   bundle. `devDependencies` are not followed: they are lint and type tooling,
 *   which changes no file deployed, and following them would choose a target
 *   whenever `eslint-config-typed` changes. What the build tools themselves
 *   read sits at the root, in `ROOT_BUILD_PATHS`, and in the workspace
 *   packages they run, `BUILD_TOOL_PACKAGES`, which are followed too. Files no
 *   build reads (`IGNORED_IN_PACKAGES`) are left out.
 *
 * The ts-data-forge rules are off for this file (`scriptsRunBeforeInstall` in
 * `tools/configs/`): ts-data-forge is not installed when this runs.
 *
 * **Run with `node`, not `tsx` or `pnpm run`**, for the reasons the header of
 * `workflow-steps.mts` gives: the job installs nothing, so this imports only
 * `node:*` modules at runtime and uses only erasable syntax. The test holds
 * that. It runs `git` and reads `package.json` files, and its job holds nothing
 * that can write.
 */
export const main = (env: Env): void => {
  const targets = orExit(parseTargets(env['TARGETS'] ?? ''));

  const base = env['BASE'] ?? '';

  const head = env['HEAD'] ?? '';

  if (head === '' || head.startsWith('-') || base.startsWith('-')) {
    exitWithError(
      `BASE "${base}" and HEAD "${head}" must name revisions (BASE may be empty).`,
    );
  }

  const packages = workspacePackages(process.cwd());

  const withPathspecs = targets.map(
    (target) =>
      [target.only, orExit(targetPathspecs(target, packages))] as const,
  );

  const chosen = withPathspecs.filter(([only, pathspecs]) => {
    if (base === '') {
      console.log(`${only}: nothing deployed yet, deploying.`);

      return true;
    }

    const changed = differs(base, head, pathspecs);

    console.log(`${only}: ${changed ? 'changed' : 'unchanged'} since ${base}.`);

    return changed;
  });

  const output = env['GITHUB_OUTPUT'];

  if (output !== undefined && output !== '') {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- $GITHUB_OUTPUT
    fs.appendFileSync(
      output,
      [
        `only=${chosen.map(([only]) => only).join(',')}`,
        `pathspecs=${JSON.stringify(Object.fromEntries(chosen))}`,
        '',
      ].join('\n'),
    );
  }
};

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

export type Parsed<T> = Readonly<
  { ok: true; value: T } | { ok: false; message: string }
>;

export type Env = ReadonlyRecord<string, string | undefined>;

export type Target = Readonly<{
  only: string;
  packages: readonly string[];
  paths: readonly string[];
}>;

/** A workspace package's name, its directory and what it depends on. */
export type WorkspacePackage = Readonly<{
  dir: string;
  dependencies: readonly string[];
}>;

/**
 * What the root holds that a build reads: the resolved third-party versions,
 * the `catalog:` and the shared build configuration (`vite-app-config.mts`, the
 * tsconfig bases, the strip pass).
 */
export const ROOT_BUILD_PATHS = [
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tools/configs/',
] as const;

/**
 * The workspace packages the build toolchain runs, whose changes reach every
 * bundle without touching a package a target bundles: the strip pass that every
 * library's build runs (`tools/configs/strip-dev-only-code.mts`) is
 * `ts-repo-utils`'. A package added to what `tools/configs/` imports at build
 * time goes here.
 */
export const BUILD_TOOL_PACKAGES = ['libs/ts-repo-utils'] as const;

/**
 * Files inside a package that no build bundles: documentation and changelogs,
 * tests, end-to-end suites and the lint configuration. A version bump still
 * chooses its package, through `package.json`.
 */
export const IGNORED_IN_PACKAGES = [
  '**/*.md',
  '**/e2e/**',
  '**/test/**',
  '**/*.test.mts',
  '**/eslint.config.mts',
] as const;

/** `TARGETS`, checked: every target names `only` and reads something. */
export const parseTargets = (json: string): Parsed<readonly Target[]> => {
  const parsed = parseJson(json);

  if (!parsed.ok) {
    return { ok: false, message: `TARGETS is not JSON: ${parsed.message}` };
  }

  if (!Array.isArray(parsed.value) || parsed.value.length === 0) {
    return { ok: false, message: 'TARGETS must be a non-empty array.' };
  }

  const mut_targets: Target[] = [];

  for (const item of parsed.value) {
    const only = field(item, 'only');

    const packages = stringList(field(item, 'packages') ?? []);

    const paths = stringList(field(item, 'paths') ?? []);

    if (typeof only !== 'string' || !/^[a-z]+$/u.test(only)) {
      return {
        ok: false,
        message: `A target's "only" must be a Firebase target such as "hosting": ${JSON.stringify(item)}`,
      };
    }

    if (packages === undefined || paths === undefined) {
      return {
        ok: false,
        message: `${only}: "packages" and "paths" must be arrays of strings.`,
      };
    }

    if (packages.length === 0 && paths.length === 0) {
      return { ok: false, message: `${only}: names no packages and no paths.` };
    }

    if (mut_targets.some((target) => target.only === only)) {
      return { ok: false, message: `${only}: named twice.` };
    }

    mut_targets.push({ only, packages, paths });
  }

  return { ok: true, value: mut_targets };
};

/**
 * The `git diff` pathspecs of `target`: its paths, and for its packages the
 * dependency closure of those and of `buildToolPackages`, with
 * `ROOT_BUILD_PATHS`, less `IGNORED_IN_PACKAGES`.
 */
export const targetPathspecs = (
  target: Target,
  packages: ReadonlyMap<string, WorkspacePackage>,
  buildToolPackages: readonly string[] = BUILD_TOOL_PACKAGES,
): Parsed<readonly string[]> => {
  const bundlesPackages = target.packages.length > 0;

  const dirs = dependencyDirs(
    bundlesPackages ? [...target.packages, ...buildToolPackages] : [],
    packages,
  );

  if (!dirs.ok) {
    return dirs;
  }

  const fromPackages = !bundlesPackages
    ? ([] as const)
    : ([
        ...dirs.value.map((dir) => `${dir}/`),
        ...ROOT_BUILD_PATHS,
        ...IGNORED_IN_PACKAGES.map((glob) => `:(exclude,glob)${glob}`),
      ] as const);

  return { ok: true, value: [...target.paths, ...fromPackages] };
};

/**
 * The directories of `roots` and of every workspace package they reach, sorted.
 * A root is a package directory; a dependency is found by name.
 */
export const dependencyDirs = (
  roots: readonly string[],
  packages: ReadonlyMap<string, WorkspacePackage>,
): Parsed<readonly string[]> => {
  const byDir = new Map(
    Array.from(packages.values(), (pkg) => [pkg.dir, pkg] as const),
  );

  const mut_seen = new Set<string>();

  const mut_queue: WorkspacePackage[] = [];

  for (const root of roots) {
    const pkg = byDir.get(root);

    if (pkg === undefined) {
      return {
        ok: false,
        message: `${root} is not a workspace package directory.`,
      };
    }

    mut_queue.push(pkg);
  }

  for (let mut_next = mut_queue.pop(); mut_next !== undefined;) {
    if (!mut_seen.has(mut_next.dir)) {
      mut_seen.add(mut_next.dir);

      for (const name of mut_next.dependencies) {
        const dependency = packages.get(name);

        if (dependency === undefined) {
          return {
            ok: false,
            message: `${mut_next.dir} depends on ${name} through workspace:, which is no workspace package.`,
          };
        }

        mut_queue.push(dependency);
      }
    }

    mut_next = mut_queue.pop();
  }

  return { ok: true, value: Array.from(mut_seen).toSorted() };
};

// ---------------------------------------------------------------------------
// The workspace
// ---------------------------------------------------------------------------

/**
 * The workspace packages under `root`, by name: the directories the root
 * `package.json` `workspaces` globs match (`check:root:workspace-globs` holds
 * them equal to `pnpm-workspace.yaml`'s), with each package's `workspace:`
 * dependencies.
 */
export const workspacePackages = (
  root: string,
): ReadonlyMap<string, WorkspacePackage> => {
  const globs = stringList(field(readJson(root, 'package.json'), 'workspaces'));

  if (globs === undefined) {
    return exitWithError('The root package.json has no "workspaces" list.');
  }

  const mut_packages = new Map<string, WorkspacePackage>();

  for (const dir of globs.flatMap((glob) => expandGlob(root, glob))) {
    const manifest = readJson(root, `${dir}/package.json`);

    const name = field(manifest, 'name');

    if (typeof name === 'string') {
      mut_packages.set(name, {
        dir,
        dependencies: workspaceDependencies(manifest),
      });
    }
  }

  return mut_packages;
};

/** The names a manifest depends on with a `workspace:` range, outside dev. */
export const workspaceDependencies = (manifest: unknown): readonly string[] =>
  ['dependencies', 'peerDependencies', 'optionalDependencies'].flatMap(
    (key) => {
      const ranges = field(manifest, key);

      if (typeof ranges !== 'object' || ranges === null) {
        return [];
      }

      return Object.entries(ranges)
        .filter(
          ([, range]) =>
            typeof range === 'string' && range.startsWith('workspace:'),
        )
        .map(([name]) => name);
    },
  );

const escapeRegExp = (text: string): string =>
  text.replaceAll(/[$()*+.?[\\\]^{|}]/gu, String.raw`\$&`);

const subdirectories = (root: string, dir: string): readonly string[] => {
  const absolute = path.join(root, dir);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a directory a workspace glob matched
  if (!fs.existsSync(absolute)) {
    return [];
  }

  return (
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a directory a workspace glob matched
    fs
      .readdirSync(absolute, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== 'node_modules')
      .map((entry) => entry.name)
  );
};

/**
 * The directories holding a `package.json` that `glob` matches. A `*` stands
 * for any part of one path segment, which is all `workspaces` uses.
 */
const expandGlob = (root: string, glob: string): readonly string[] =>
  glob
    .split('/')
    .reduce<readonly string[]>(
      (dirs, segment) =>
        dirs.flatMap((dir) => {
          if (!segment.includes('*')) {
            return [path.posix.join(dir, segment)];
          }

          // eslint-disable-next-line security/detect-non-literal-regexp -- the segment's literal parts are escaped
          const pattern = new RegExp(
            `^${segment.split('*').map(escapeRegExp).join('[^/]*')}$`,
            'u',
          );

          return subdirectories(root, dir)
            .filter((name) => pattern.test(name))
            .map((name) => path.posix.join(dir, name));
        }),
      ['.'],
    )
    .map(path.posix.normalize)
    .filter((dir) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a directory a workspace glob matched
      fs.existsSync(path.join(root, dir, 'package.json')),
    );

// ---------------------------------------------------------------------------
// Running
// ---------------------------------------------------------------------------

/** An error annotation on the step, then a failed step. */
const exitWithError = (message: string): never => {
  console.log(`::error::${message}`);

  process.exit(1);
};

const orExit = <T,>(parsed: Parsed<T>): T =>
  parsed.ok ? parsed.value : exitWithError(parsed.message);

/** Whether `pathspecs` differ between `base` and `head`; any other failure exits. */
const differs = (
  base: string,
  head: string,
  pathspecs: readonly string[],
): boolean => {
  const { status, error } = spawnSync(
    'git',
    ['diff', '--quiet', '--no-renames', base, head, '--', ...pathspecs],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  );

  if (error !== undefined) {
    exitWithError(`git could not be run: ${error.message}`);
  }

  switch (status) {
    case 0:
      return false;

    case 1:
      return true;

    case null:
    default:
      // A failing `git diff` read as "unchanged" would skip a deploy with
      // nothing red.
      return exitWithError(`git diff ${base} ${head} exited with ${status}.`);
  }
};

const parseJson = (json: string): Parsed<unknown> => {
  try {
    return { ok: true, value: JSON.parse(json) as unknown };
  } catch {
    return { ok: false, message: 'it does not parse as JSON' };
  }
};

const readJson = (root: string, file: string): unknown => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a manifest in the workspace
  const parsed = parseJson(fs.readFileSync(path.join(root, file), 'utf8'));

  return parsed.ok ? parsed.value : exitWithError(`${file}: ${parsed.message}`);
};

/** `value[key]` when `value` is an object with `key` of its own. */
const field = (value: unknown, key: string): unknown =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).find(([k]) => k === key)?.[1]
    : undefined;

const stringList = (value: unknown): readonly string[] | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const strings = value.filter(
    (item): item is string => typeof item === 'string',
  );

  return strings.length === value.length ? strings : undefined;
};

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: that package is not
 * installed when this runs (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  main(process.env);
}
