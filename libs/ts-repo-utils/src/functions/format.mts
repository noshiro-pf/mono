import { type ExecException } from 'node:child_process';
import * as prettier from 'prettier';
import { Arr, isNotUndefined, Result } from 'ts-data-forge';
import '../node-global.mjs';
import {
  getDiffFrom,
  getModifiedFiles,
  getStagedFiles,
  getUntrackedFiles,
} from './diff.mjs';

/**
 * Format a list of files using Prettier
 *
 * @param files - Array of file paths to format
 */
export const formatFiles = async (
  files: readonly string[],
  options?: Readonly<{
    silent?: boolean;
    ignore?: (filePath: string) => boolean;
  }>,
): Promise<Result<undefined, readonly unknown[]>> => {
  const silent = options?.silent ?? false;

  const conditionalEcho = silent ? () => {} : echo;

  if (files.length === 0) {
    conditionalEcho('No files to format');
    return Result.ok(undefined);
  }

  conditionalEcho(`Formatting ${files.length} files...`);

  // Format each file
  const results: readonly PromiseSettledResult<Result<undefined, unknown>>[] =
    // NOTE: Using Promise.allSettled to ensure all files are processed even if some fail
    await Promise.allSettled(
      files.map(async (filePath) => {
        try {
          // Check if file exists first
          try {
            await fs.access(filePath);
          } catch {
            // File doesn't exist, skip it
            conditionalEcho(`Skipping non-existent file: ${filePath}`);
            return Result.ok(undefined);
          }

          // Read file content
          const content = await fs.readFile(filePath, 'utf8');

          // Resolve prettier config for this file
          const prettierOptions = await prettier.resolveConfig(filePath);

          // Check if file is ignored by prettier
          const fileInfo = await prettier.getFileInfo(filePath, {
            ignorePath: '.prettierignore',
          });

          if (
            fileInfo.ignored ||
            (options?.ignore ?? defaultIgnoreFn)(filePath)
          ) {
            conditionalEcho(`Skipping ignored file: ${filePath}`);
            return Result.ok(undefined);
          }

          // Format the content
          const formatted = await prettier.format(content, {
            ...prettierOptions,
            filepath: filePath,
          });

          // Only write if content changed
          if (formatted === content) {
            conditionalEcho(`Unchanged: ${filePath}`);
          } else {
            await fs.writeFile(filePath, formatted, 'utf8');
            conditionalEcho(`Formatted: ${filePath}`);
          }

          return Result.ok(undefined);
        } catch (error) {
          if (!silent) {
            console.error(`Error formatting ${filePath}:`, error);
          }
          return Result.err(error);
        }
      }),
    );

  if (results.every((r) => r.status === 'fulfilled')) {
    const fulfilled = results.map((r) => r.value);
    if (fulfilled.every(Result.isOk)) {
      return Result.ok(undefined);
    } else {
      const errors: readonly unknown[] = fulfilled
        .filter(Result.isErr)
        .map((r) => r.value);

      return Result.err(errors);
    }
  } else {
    const errors: readonly unknown[] = results
      .filter((r) => r.status === 'rejected')
      .map((r) => r.reason as unknown);

    return Result.err(errors);
  }
};

const defaultIgnoreFn = (filePath: string): boolean => {
  const filename = path.basename(filePath);

  return (
    ignoreFiles.has(filename) ||
    filename.startsWith('.env') ||
    ignoreExtensions.some((ext) => filePath.endsWith(ext)) ||
    ignoreDirs.some((dir) => filename.startsWith(dir))
  );
};

const ignoreFiles: ReadonlySet<string> = new Set([
  '.DS_Store',
  'package-lock.json',
  'LICENSE',
  '.prettierignore',
  '.editorconfig',
  '.gitignore',
]);

const ignoreExtensions: readonly string[] = [
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.tiff',
  '.bak',
  '.log',
  '.zip',
  '.tar',
  '.gz',
  '.7z',
  '.mp3',
  '.mp4',
  '.avi',
  '.mkv',
  '.tsbuildinfo',
] as const;

const ignoreDirs: readonly string[] = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  '.cache',
  '.vscode',
  '.yarn',
] as const;

/**
 * Format files matching the given glob pattern using Prettier
 *
 * @param pathGlob - Glob pattern to match files
 */
export const formatFilesGlob = async (
  pathGlob: string,
  options?: Readonly<{ silent?: boolean }>,
): Promise<Result<undefined, unknown>> => {
  const silent = options?.silent ?? false;
  const conditionalEcho = silent ? () => {} : echo;

  try {
    // Find all files matching the glob
    const files = await glob(pathGlob, {
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**'],
      dot: true,
    });

    if (files.length === 0) {
      conditionalEcho('No files found matching pattern:', pathGlob);
      return Result.ok(undefined);
    }

    return await formatFiles(files, { silent });
  } catch (error) {
    if (!silent) {
      console.error('Error in formatFiles:', error);
    }
    return Result.err(error);
  }
};

/**
 * Format only files that have been changed (git status)
 *
 * @param options - Options for formatting
 */
export const formatUncommittedFiles = async (
  options?: Readonly<{
    untracked?: boolean;
    modified?: boolean;
    staged?: boolean;
    silent?: boolean;
  }>,
): Promise<
  Result<
    undefined,
    ExecException | Readonly<{ message: string }> | readonly unknown[]
  >
> => {
  const {
    untracked = true,
    modified = true,
    staged = true,
    silent = false,
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

  return formatFiles(Arr.uniq(mut_files), { silent });
};

/**
 * Format only files that differ from the specified base branch or commit
 *
 * @param base - Base branch name or commit hash to compare against (defaults to
 *   'main')
 * @param options - Options for formatting
 * @param options.includeUntracked - Include untracked files in addition to diff
 *   files (default is true)
 * @param options.includeStaged - Include staged files in addition to diff files
 *   (default is true)
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
  }>,
): Promise<
  Result<
    undefined,
    | ExecException
    | Readonly<{
        message: string;
      }>
    | readonly unknown[]
  >
> => {
  // const silent = options?.silent ?? false;
  const {
    silent = false,
    includeUntracked = true,
    includeModified = true,
    includeStaged = true,
  } = options ?? {};

  const conditionalEcho = silent ? () => {} : echo;

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
    if (flag) {
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
  }

  const allFiles = Arr.uniq(mut_allFiles);

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

  if (allFiles.length === 0) {
    conditionalEcho('No files to format');
    return Result.ok(undefined);
  }

  return formatFiles(allFiles, { silent });
};
