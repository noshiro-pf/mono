import glob from 'fast-glob';
import { readFile, writeFile } from 'node:fs/promises';
import * as prettier from 'prettier';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';
import { getDiffFrom, getUntrackedFiles } from './diff.mjs';

/**
 * Format a list of files using Prettier
 * @param files - Array of file paths to format
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export const formatFilesList = async (
  files: readonly string[],
): Promise<'ok' | 'err'> => {
  if (files.length === 0) {
    echo('No files to format');
    return 'ok';
  }

  echo(`Formatting ${files.length} files...`);

  // Format each file
  const results = await Promise.allSettled(
    files.map(async (filePath) => {
      try {
        // Read file content
        const content = await readFile(filePath, 'utf8');

        // Resolve prettier config for this file
        const options = await prettier.resolveConfig(filePath);

        // Check if file is ignored by prettier
        const fileInfo = await prettier.getFileInfo(filePath, {
          ignorePath: '.prettierignore',
        });

        if (fileInfo.ignored) {
          echo(`Skipping ignored file: ${filePath}`);
          return;
        }

        // Format the content
        const formatted = await prettier.format(content, {
          ...options,
          filepath: filePath,
        });

        // Only write if content changed
        if (formatted !== content) {
          await writeFile(filePath, formatted, 'utf8');
          echo(`Formatted: ${filePath}`);
        }
      } catch (error) {
        console.error(`Error formatting ${filePath}:`, error);
        throw error;
      }
    }),
  );

  // Check if any formatting failed
  const hasErrors = results.some((result) => result.status === 'rejected');
  return hasErrors ? 'err' : 'ok';
};

/**
 * Format files matching the given glob pattern using Prettier
 * @param pathGlob - Glob pattern to match files
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export const formatFiles = async (pathGlob: string): Promise<'ok' | 'err'> => {
  try {
    // Find all files matching the glob
    const files = await glob(pathGlob, {
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**'],
      dot: true,
    });

    if (files.length === 0) {
      echo('No files found matching pattern:', pathGlob);
      return 'ok';
    }

    return await formatFilesList(files);
  } catch (error) {
    console.error('Error in formatFiles:', error);
    return 'err';
  }
};

/**
 * Format only files that have been changed (git status)
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export const formatUntracked = async (): Promise<'ok' | 'err'> => {
  try {
    const untrackedFilesResult = await getUntrackedFiles();

    if (Result.isErr(untrackedFilesResult)) {
      console.error('Error getting changed files:', untrackedFilesResult.value);
      return 'err';
    }

    const files = untrackedFilesResult.value;

    if (files.length === 0) {
      echo('No changed files to format');
      return 'ok';
    }

    echo('Formatting changed files:', files);

    // Filter out non-existent files before formatting
    const fileExistenceChecks = await Promise.allSettled(
      files.map(async (filePath) => {
        try {
          await readFile(filePath, 'utf8');
          return filePath;
        } catch {
          echo(`Skipping non-existent file: ${filePath}`);
          return undefined;
        }
      }),
    );

    const existingFiles = fileExistenceChecks
      .filter(
        (result): result is PromiseFulfilledResult<string> =>
          result.status === 'fulfilled' && result.value !== undefined,
      )
      .map((result) => result.value);

    return await formatFilesList(existingFiles);
  } catch (error) {
    console.error('Error in formatUntracked:', error);
    return 'err';
  }
};

/**
 * Format only files that differ from the specified base branch or commit
 * @param base - Base branch name or commit hash to compare against (defaults to 'main')
 * @param options - Options for formatting
 * @param options.includeUntracked - Include untracked files in addition to diff files (default is true)
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export const formatDiffFrom = async (
  base: string,
  options?: Readonly<{ includeUntracked?: boolean }>,
): Promise<'ok' | 'err'> => {
  try {
    // Get files that differ from base branch/commit (excluding deleted files)
    const diffFromBaseResult = await getDiffFrom(base);

    if (Result.isErr(diffFromBaseResult)) {
      console.error('Error getting changed files:', diffFromBaseResult.value);
      return 'err';
    }

    const diffFiles = diffFromBaseResult.value;
    let allFiles = diffFiles;

    // If includeUntracked is true, also get untracked files
    if (options?.includeUntracked ?? true) {
      const untrackedFilesResult = await getUntrackedFiles();

      if (Result.isErr(untrackedFilesResult)) {
        console.error(
          'Error getting untracked files:',
          untrackedFilesResult.value,
        );
        return 'err';
      }

      const untrackedFiles = untrackedFilesResult.value;

      // Combine and deduplicate files
      const uniqueFiles = new Set([...diffFiles, ...untrackedFiles]);
      allFiles = Array.from(uniqueFiles);

      echo(
        `Formatting files that differ from ${base} and untracked files:`,
        allFiles,
      );
    } else {
      echo(`Formatting files that differ from ${base}:`, allFiles);
    }

    if (allFiles.length === 0) {
      echo(`No files to format`);
      return 'ok';
    }

    return await formatFilesList(allFiles);
  } catch (error) {
    console.error('Error in formatDiffFrom:', error);
    return 'err';
  }
};
