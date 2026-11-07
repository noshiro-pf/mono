import { restrictedImportsOptions } from 'eslint-config-typed';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  forEachLintedFile,
  importPackageEslintConfigs,
  listLintedPackages,
  severityNumber,
} from '../lib/eslint-package-configs.mjs';
import { listTrackedFiles } from '../lib/repo-files.mjs';

/**
 * Fails when a file ESLint lints has `no-restricted-imports` on without the
 * pattern `eslint-config-typed` sets it with, which refuses an `index.mjs`
 * imported by relative path.
 *
 * A config that sets the rule replaces the options an earlier one set, so a
 * package that adds a restriction with a bare options object drops the pattern
 * from those files, and nothing fails: the import it refuses is simply allowed.
 * The fix is to merge, `mergeRestrictedImportsOptions(restrictedImportsOptions,
 * mine)`. A file `sumi check` checks is no exception: Sumi's off-config leaves
 * the rule on (`keptOnRules` in `@sumi-lang/cli`), because it carries a
 * package's own restrictions too (#3068).
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

const [{ regex: indexFilePatternRegex }] = restrictedImportsOptions.patterns;

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

  return mut_lacking;
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
