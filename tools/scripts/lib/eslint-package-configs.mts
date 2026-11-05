import { ESLint, type Linter } from 'eslint';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { isUnderExperimental } from './repo-files.mjs';

/** The extensions ESLint lints in a package. */
export const lintedExtensions = /\.(?:[cm]?[jt]s|[jt]sx)$/u;

/** The `scripts` of the `package.json` in `dir`, relative to the root. */
export const readScripts = async (
  dir: string,
): Promise<ReadonlyRecord<string, unknown>> => {
  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the package.json of a workspace member git lists
    await fs.readFile(
      path.resolve(projectRootPath, dir, 'package.json'),
      'utf8',
    ),
  );

  return isRecord(manifest) &&
    hasKey(manifest, 'scripts') &&
    isRecord(manifest.scripts)
    ? manifest.scripts
    : {};
};

/**
 * The packages `ws:fix:lint` reaches: every member with a `fix:lint`, from the
 * files `listTrackedFiles` returns.
 */
export const listLintedPackages = async (
  trackedFiles: readonly string[],
): Promise<readonly string[]> => {
  const manifests = trackedFiles
    .filter(
      (file) => file.endsWith('/package.json') && !isUnderExperimental(file),
    )
    .map(path.posix.dirname);

  const withFixLint = await Promise.all(
    manifests.map(async (dir) =>
      hasKey(await readScripts(dir), 'fix:lint') ? [dir] : [],
    ),
  );

  return withFixLint.flat().toSorted();
};

/**
 * The array the package's `eslint.config.mts` exports, or `undefined` when it
 * exports something else. Importing it needs the workspace built, as it imports
 * the plugins by name.
 */
export const importPackageEslintConfigs = async (
  dir: string,
): Promise<readonly unknown[] | undefined> => {
  const configModule: unknown = await import(
    pathToFileURL(path.join(projectRootPath, dir, 'eslint.config.mts')).href
  );

  const configs: unknown =
    isRecord(configModule) && hasKey(configModule, 'default')
      ? configModule.default
      : undefined;

  return Arr.isArray(configs) ? configs : undefined;
};

/**
 * Resolves `configs` for every file of the package that ESLint lints, in the
 * order `trackedFiles` lists them, and passes each file's resolved rules to
 * `visit` with the file's path from the repository root. Returns those files,
 * relative to the repository root.
 */
export const forEachLintedFile = async (
  dir: string,
  configs: readonly unknown[],
  trackedFiles: readonly string[],
  visit: (
    repoRelative: string,
    rules: ReadonlyRecord<string, unknown>,
  ) => void | Promise<void>,
): Promise<readonly string[]> => {
  const eslint = createPackageEslint(dir, configs);

  const files = trackedFiles.filter(
    (file) => file.startsWith(`${dir}/`) && lintedExtensions.test(file),
  );

  const mut_lintedFiles: string[] = [];

  for (const file of files) {
    const resolved = await resolveConfig(
      eslint,
      path.join(projectRootPath, file),
    );

    if (resolved === undefined) {
      continue;
    }

    mut_lintedFiles.push(file);

    const rules = rulesOf(resolved);

    if (rules !== undefined) {
      await visit(file, rules);
    }
  }

  return mut_lintedFiles;
};

/** An ESLint that reads `configs` in place of the package's config file. */
export const createPackageEslint = (
  dir: string,
  configs: readonly unknown[],
): ESLint =>
  new ESLint({
    cwd: path.join(projectRootPath, dir),
    overrideConfigFile: true,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the array a package's `eslint.config.mts` exports, which ESLint validates
    overrideConfig: Array.from(configs as readonly Linter.Config[]),
  });

/**
 * The rules `eslint` applies to the file at `absolute`, or `undefined` when it
 * ignores the file.
 */
export const resolveRules = async (
  eslint: ESLint,
  absolute: string,
): Promise<ReadonlyRecord<string, unknown> | undefined> => {
  const resolved = await resolveConfig(eslint, absolute);

  return resolved === undefined ? undefined : rulesOf(resolved);
};

/** ESLint resolves a severity to a number; a config may write it as a word. */
export const severityNumber = (severity: unknown): unknown => {
  switch (severity) {
    case 'off':
      return 0;

    case 'warn':
      return 1;

    case 'error':
      return 2;

    default:
      return severity;
  }
};

// `undefined` for a file ESLint ignores, as `isPathIgnored` reads it.
const resolveConfig = async (
  eslint: ESLint,
  absolute: string,
): Promise<unknown> => eslint.calculateConfigForFile(absolute);

const rulesOf = (
  resolved: unknown,
): ReadonlyRecord<string, unknown> | undefined => {
  const rules: unknown =
    isRecord(resolved) && hasKey(resolved, 'rules')
      ? resolved.rules
      : undefined;

  return isRecord(rules) ? rules : undefined;
};
