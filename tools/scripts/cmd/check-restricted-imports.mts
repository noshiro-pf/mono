import { restrictedImportsOptions } from 'eslint-config-typed';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  createPackageEslint,
  forEachLintedFile,
  importPackageEslintConfigs,
  listLintedPackages,
  resolveRules,
  severityNumber,
} from '../lib/eslint-package-configs.mjs';
import { listTrackedFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a file ESLint lints has `no-restricted-imports` on without the
 * pattern `eslint-config-typed` sets it with, which refuses an `index.mjs`
 * imported by relative path.
 *
 * A config that sets the rule replaces the options an earlier one set, so a
 * package that adds a restriction with a bare options object drops the pattern
 * from those files, and nothing fails: the import it refuses is simply allowed.
 * The fix is to merge, `mergeRestrictedImportsOptions(restrictedImportsOptions,
 * mine)`. A file `sumi check` checks is exempt, because Sumi refuses that
 * import itself (`modules/no-index-file-import`) and its off-config turns the
 * rule off there; a package may turn it back on for paths of its own.
 *
 * Reading each package's configuration needs the workspace built, as
 * `eslint.config.mts` imports the plugins by name.
 */
export const checkRestrictedImports = async (): Promise<
  Result<number, string>
> => {
  const trackedFiles = await listTrackedFiles();

  if (Result.isErr(trackedFiles)) {
    return trackedFiles;
  }

  const packageDirs = await listLintedPackages(trackedFiles.value);

  const perPackage = await Promise.all(
    packageDirs.map((dir) => checkPackage(dir, trackedFiles.value)),
  );

  const violations = perPackage.flat();

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} file(s) where no-restricted-imports is on without eslint-config-typed's index-file pattern:`,
        '',
        ...violations.map((violation) => `  ${violation}`),
        '',
        'A config that sets the rule replaces the options set before it. Wrap the',
        "package's options in `mergeRestrictedImportsOptions(restrictedImportsOptions, {...})`",
        "(both from 'eslint-config-typed') so the pattern stays.",
      ].join('\n'),
    );
  }

  return Result.ok(packageDirs.length);
};

/**
 * Whether the resolved `no-restricted-imports` entry is on but does not refuse
 * what `restrictedImportsOptions` refuses.
 */
export const lacksIndexFilePattern = (entry: unknown): boolean =>
  isOn(entry) && !hasIndexFilePattern(entry);

/**
 * The block for a second resolution that asks which files `sumi check` reads:
 * its rules emptied, or, for the Sumi off-config where it does turn
 * `no-restricted-imports` off, replaced by the rule set to the base options.
 * `rules` stays as a key, since a block of `ignores` alone is a global ignore,
 * and every other key is kept, so which files a block matches does not change.
 * An off-config that stops turning the rule off exempts nothing.
 */
export const toSumiProbe = (config: unknown): unknown => {
  if (!isRecord(config) || !hasKey(config, 'rules')) {
    return config;
  }

  const isSumiOff =
    hasKey(config, 'name') &&
    config.name === sumiOffConfigName &&
    isRecord(config.rules) &&
    hasKey(config.rules, ruleId) &&
    !isOn(config.rules[ruleId]);

  return {
    ...config,
    rules: isSumiOff ? { [ruleId]: ['error', restrictedImportsOptions] } : {},
  };
};

const [{ regex: indexFilePatternRegex }] = restrictedImportsOptions.patterns;

/** The `name` of `eslintConfigOffForSumiCheck` in `@sumi-lang/cli`. */
const sumiOffConfigName = 'sumi/off-for-sumi-check';

const ruleId = 'no-restricted-imports';

/** Whether a rule entry, resolved or as a config writes it, is not off. */
const isOn = (entry: unknown): boolean => {
  const severity: unknown = Arr.isArray(entry) ? entry[0] : entry;

  return severity !== undefined && severityNumber(severity) !== 0;
};

/**
 * Whether the entry's options have the pattern: one with the same `regex`,
 * whatever its message. Whether the entry is on is `isOn`'s.
 */
const hasIndexFilePattern = (entry: unknown): boolean => {
  const objectOptions: unknown = Arr.isArray(entry) ? entry[1] : undefined;

  const patterns: unknown =
    isRecord(objectOptions) && hasKey(objectOptions, 'patterns')
      ? objectOptions.patterns
      : undefined;

  return (
    Arr.isArray(patterns) &&
    patterns.some(
      (pattern) =>
        isRecord(pattern) &&
        hasKey(pattern, 'regex') &&
        pattern.regex === indexFilePatternRegex,
    )
  );
};

const checkPackage = async (
  dir: string,
  trackedFiles: readonly string[],
): Promise<readonly string[]> => {
  const configs = await importPackageEslintConfigs(dir);

  if (configs === undefined) {
    return [`${dir}/eslint.config.mts: the default export is not an array.`];
  }

  const mut_lacking: string[] = [];

  await forEachLintedFile(dir, configs, trackedFiles, (repoRelative, rules) => {
    if (lacksIndexFilePattern(rules[ruleId])) {
      mut_lacking.push(repoRelative);
    }
  });

  if (!Arr.isNonEmpty(mut_lacking)) {
    return [];
  }

  // Only the files found lacking are resolved again, against the Sumi blocks
  // alone, which set the rule to the base options there: a file that keeps the
  // pattern this time is one `sumi check` reads.
  // Flattened first, since a nested array is a block that `toSumiProbe` would
  // otherwise pass over with its rules.
  const sumiProbe = createPackageEslint(
    dir,
    configs.flat(Number.POSITIVE_INFINITY).map(toSumiProbe),
  );

  const perFile = await Promise.all(
    mut_lacking.map(async (repoRelative) => {
      const probed = await resolveRules(
        sumiProbe,
        path.join(projectRootPath, repoRelative),
      );

      return probed !== undefined &&
        isOn(probed[ruleId]) &&
        hasIndexFilePattern(probed[ruleId])
        ? []
        : [repoRelative];
    }),
  );

  return perFile.flat();
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkRestrictedImports().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} package(s) checked; every file with no-restricted-imports on keeps the index-file pattern.`,
  );
}
