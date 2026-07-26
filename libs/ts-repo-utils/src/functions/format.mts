import { type ExecException } from 'node:child_process';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { Arr, isNotUndefined, Result } from 'ts-data-forge';
import { pathExists } from './assert-path-exists.mjs';
import {
  getDiffFrom,
  getModifiedFiles,
  getStagedFiles,
  getUntrackedFiles,
} from './diff.mjs';
import { $ } from './exec-async.mjs';
import { glob } from './glob.mjs';

/**
 * Resolves the path to a peer-dependency CLI's executable, given the
 * package's name and the path to its bin script relative to the package
 * root. Peer dependencies (like `typescript`, `eslint`, `oxfmt`, or
 * `organize-imports-cli`) must be resolved relative to the consuming
 * package rather than bundled with this package.
 */
const resolvePeerBin = (
  packageName: string,
  binPathInPackage: string,
): string => {
  const packageJsonPath = createRequire(import.meta.url).resolve(
    `${packageName}/package.json`,
  );

  return path.join(path.dirname(packageJsonPath), binPathInPackage);
};

const resolveOxfmtBin = (): string => resolvePeerBin('oxfmt', 'bin/oxfmt');

const resolveOrganizeImportsCliBin = (): string =>
  resolvePeerBin('organize-imports-cli', 'cli.js');

/**
 * Format a list of files: first `organize-imports-cli` (sorts imports and
 * removes unused ones, via the same TypeScript language-service
 * `organizeImports` call that `prettier-plugin-organize-imports` used to
 * wrap), then Oxfmt (`sortImports` is intentionally left disabled in
 * `.oxfmtrc.json` so import sorting stays organize-imports-cli's job
 * alone).
 *
 * Files that don't exist are silently skipped (this can happen with files
 * reported by `git diff` that were deleted). Both tools silently skip files
 * they don't recognize; Oxfmt additionally respects `.gitignore` /
 * `.prettierignore`. So no separate ignore handling is needed here.
 *
 * @param files - Array of file paths to format
 */
export const formatFiles = async (
  files: readonly string[],
  options?: Readonly<{ silent?: boolean }>,
): Promise<Result<undefined, ExecException>> => {
  const silent = options?.silent ?? false;

  const conditionalEcho = silent ? () => {} : console.info;

  if (Arr.isEmpty(files)) {
    conditionalEcho('No files to format');

    return Result.ok(undefined);
  }

  const existenceChecks = await Promise.all(
    files.map(async (filePath) => ({
      filePath,
      exists: await pathExists(filePath),
    })),
  );

  const existingFiles = existenceChecks
    .filter(({ exists }) => exists)
    .map(({ filePath }) => filePath);

  for (const { filePath, exists } of existenceChecks) {
    if (!exists) {
      conditionalEcho(`Skipping non-existent file: ${filePath}`);
    }
  }

  if (Arr.isEmpty(existingFiles)) {
    conditionalEcho('No files to format');

    return Result.ok(undefined);
  }

  conditionalEcho(`Formatting ${existingFiles.length} files...`);

  const quotedFiles = existingFiles.map((f) => `"${f}"`).join(' ');

  const organizeImportsBin = resolveOrganizeImportsCliBin();

  const organizeImportsResult = await $(
    `node "${organizeImportsBin}" ${quotedFiles}`,
    { silent },
  );

  if (Result.isErr(organizeImportsResult)) {
    if (!silent) {
      console.error(
        'Error organizing imports:',
        organizeImportsResult.value.message,
      );
    }

    return Result.err(organizeImportsResult.value);
  }

  const oxfmtBin = resolveOxfmtBin();

  // `--no-error-on-unmatched-pattern` keeps Oxfmt from exiting non-zero when
  // every file passed to it is excluded by an ignore rule. That is a normal
  // situation here (e.g. formatting only files under a `.prettierignore`d
  // `docs/` directory), not a failure.
  const result = await $(
    `node "${oxfmtBin}" --write --no-error-on-unmatched-pattern ${quotedFiles}`,
    { silent },
  );

  if (Result.isErr(result)) {
    if (!silent) {
      console.error('Error formatting files:', result.value.message);
    }

    return Result.err(result.value);
  }

  return Result.ok(undefined);
};

/**
 * Format files matching the given glob pattern using Oxfmt.
 *
 * @param pathGlob - Glob pattern to match files
 */
export const formatFilesGlob = async (
  pathGlob: string,
  options?: Readonly<{ silent?: boolean }>,
): Promise<Result<undefined, unknown>> => {
  const silent = options?.silent ?? false;

  const conditionalEcho = silent ? () => {} : console.info;

  const globResult = await glob(pathGlob, {
    absolute: true,
    ignore: ['**/node_modules/**', '**/.git/**'],
    dot: true,
  });

  if (Result.isErr(globResult)) {
    const error = globResult.value;

    if (!silent) {
      console.error('Error in formatFilesGlob:', error);
    }

    return Result.err(error);
  }

  const files = globResult.value;

  if (Arr.isEmpty(files)) {
    conditionalEcho('No files found matching pattern:', pathGlob);

    return Result.ok(undefined);
  }

  return formatFiles(files, { silent });
};

/**
 * Format only files that have been changed (git status)
 *
 * @param options - Options for formatting
 * @param options.cwd - If provided, only files within this directory will be
 *   formatted. Relative paths are resolved against `process.cwd()`. Defaults
 *   to undefined (no filtering; all changed files in the repository are
 *   formatted).
 */
export const formatUncommittedFiles = async (
  options?: Readonly<{
    untracked?: boolean;
    modified?: boolean;
    staged?: boolean;
    silent?: boolean;
    cwd?: string;
  }>,
): Promise<
  Result<undefined, ExecException | Readonly<{ message: string }>>
> => {
  const {
    untracked = true,
    modified = true,
    staged = true,
    silent = false,
    cwd,
  } = options ?? {};

  const mut_files: string[] = [];

  if (untracked) {
    const untrackedFilesResult = await getUntrackedFiles({ silent });

    if (Result.isErr(untrackedFilesResult)) {
      if (!silent) {
        console.error(
          'Error getting changed files:',
          untrackedFilesResult.value,
        );
      }

      return untrackedFilesResult;
    }

    mut_files.push(...untrackedFilesResult.value);
  }

  if (modified) {
    const diffFilesResult = await getModifiedFiles({ silent });

    if (Result.isErr(diffFilesResult)) {
      if (!silent) {
        console.error('Error getting changed files:', diffFilesResult.value);
      }

      return diffFilesResult;
    }

    mut_files.push(...diffFilesResult.value);
  }

  if (staged) {
    const stagedFilesResult = await getStagedFiles({ silent });

    if (Result.isErr(stagedFilesResult)) {
      if (!silent) {
        console.error('Error getting changed files:', stagedFilesResult.value);
      }

      return stagedFilesResult;
    }

    mut_files.push(...stagedFilesResult.value);
  }

  return formatFiles(filterFilesByCwd(Arr.uniq(mut_files), cwd), { silent });
};

/**
 * Filter a list of file paths to those inside `cwd`. If `cwd` is undefined,
 * returns the original list unchanged. Relative `cwd` is resolved against
 * `process.cwd()`.
 */
const filterFilesByCwd = (
  files: readonly string[],
  cwd: string | undefined,
): readonly string[] => {
  if (cwd === undefined) {
    return files;
  }

  const resolvedCwd = path.resolve(cwd);

  const cwdWithSep = resolvedCwd.endsWith(path.sep)
    ? resolvedCwd
    : (`${resolvedCwd}${path.sep}` as const);

  return files.filter((file) => {
    const absFile = path.isAbsolute(file) ? file : path.resolve(file);

    return absFile === resolvedCwd || absFile.startsWith(cwdWithSep);
  });
};

/**
 * Format only files that differ from the specified base branch or commit
 *
 * @param base - Base branch name or commit hash to compare against (defaults
 *   to 'main')
 * @param options - Options for formatting
 * @param options.includeUntracked - Include untracked files in addition to
 *   diff files (default is true)
 * @param options.includeStaged - Include staged files in addition to diff
 *   files (default is true)
 * @param options.silent - Silent mode to suppress command output (default is
 *   false)
 */
export const formatDiffFrom = async (
  base: string,
  options?: Readonly<{
    includeUntracked?: boolean;
    includeModified?: boolean;
    includeStaged?: boolean;
    silent?: boolean;
    cwd?: string;
  }>,
): Promise<
  Result<undefined, ExecException | Readonly<{ message: string }>>
> => {
  const {
    silent = false,
    includeUntracked = true,
    includeModified = true,
    includeStaged = true,
    cwd,
  } = options ?? {};

  const conditionalEcho = silent ? () => {} : console.info;

  // Get files that differ from base branch/commit (excluding deleted files)
  const diffFromBaseResult = await getDiffFrom(base, {
    silent,
  });

  if (Result.isErr(diffFromBaseResult)) {
    if (!silent) {
      console.error('Error getting changed files:', diffFromBaseResult.value);
    }

    return diffFromBaseResult;
  }

  const diffFiles = diffFromBaseResult.value;

  const mut_allFiles: string[] = diffFiles.slice();

  // If includeUntracked is true, also get untracked files
  for (const { type, flag, fn } of [
    { type: 'untracked', flag: includeUntracked, fn: getUntrackedFiles },
    { type: 'modified', flag: includeModified, fn: getModifiedFiles },
    { type: 'staged', flag: includeStaged, fn: getStagedFiles },
  ]) {
    if (!flag) {
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const filesResult = await fn({ silent });

    if (Result.isErr(filesResult)) {
      if (!silent) {
        console.error(`Error getting ${type} files:`, filesResult.value);
      }

      return filesResult;
    }

    const files = filesResult.value;

    // Combine and deduplicate files
    mut_allFiles.push(...files);
  }

  const allFiles = filterFilesByCwd(Arr.uniq(mut_allFiles), cwd);

  if (!silent) {
    const includedFileTypes = [
      includeUntracked ? 'untracked files' : undefined,
      includeModified ? 'modified files' : undefined,
      includeStaged ? 'staged files' : undefined,
    ].filter(isNotUndefined);

    const message = [
      `Formatting files that differ from ${base}`,
      includedFileTypes
        .map((s, i) =>
          i !== includedFileTypes.length - 1 ? `, ${s}` : ` and ${s}`,
        )
        .join(''),
    ].join('');

    conditionalEcho(`${message}:`, allFiles);
  }

  if (Arr.isEmpty(allFiles)) {
    conditionalEcho('No files to format');

    return Result.ok(undefined);
  }

  return formatFiles(allFiles, { silent });
};
