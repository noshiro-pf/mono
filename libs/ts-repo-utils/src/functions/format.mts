import glob from 'fast-glob';
import { exec } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import * as prettier from 'prettier';

const execAsync = promisify(exec);

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
      console.log('No files found matching pattern:', pathGlob);
      return 'ok';
    }

    console.log(`Formatting ${files.length} files...`);

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
            console.log(`Skipping ignored file: ${filePath}`);
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
            console.log(`Formatted: ${filePath}`);
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
  } catch (error) {
    console.error('Error in formatFiles:', error);
    return 'err';
  }
};

/**
 * Format only files that have been changed (git status)
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export const formatChanged = async (): Promise<'ok' | 'err'> => {
  try {
    // Get changed files from git status
    const { stdout, stderr } = await execAsync('git status --porcelain');

    if (stderr !== '') {
      console.error('Git error:', stderr);
      return 'err';
    }

    // Parse git status output
    const files = stdout
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        // Status format: "XY filename" where X and Y are status codes
        const match = /^..\s+(.+)$/u.exec(line);
        return match?.[1];
      })
      .filter(
        (file): file is string =>
          // Filter out deleted files (status starts with 'D')
          file !== undefined && !stdout.includes(`D  ${file}`),
      );

    if (files.length === 0) {
      console.log('No changed files to format');
      return 'ok';
    }

    console.log('Formatting changed files:', files);

    // Format each changed file
    const results = await Promise.allSettled(
      files.map(async (filePath) => {
        try {
          // Check if file exists and is not deleted
          const content = await readFile(filePath, 'utf8').catch(() => null);
          if (content === null) {
            console.log(`Skipping non-existent file: ${filePath}`);
            return;
          }

          // Resolve prettier config for this file
          const options = await prettier.resolveConfig(filePath);

          // Check if file is ignored by prettier
          const fileInfo = await prettier.getFileInfo(filePath, {
            ignorePath: '.prettierignore',
          });

          if (fileInfo.ignored) {
            console.log(`Skipping ignored file: ${filePath}`);
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
            console.log(`Formatted: ${filePath}`);
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
  } catch (error) {
    console.error('Error in formatChanged:', error);
    return 'err';
  }
};

/**
 * Format only files that differ from the specified base branch or commit
 * @param base - Base branch name or commit hash to compare against (defaults to 'main')
 * @returns 'ok' if successful, 'err' if any errors occurred
 */
export const formatDiffFrom = async (
  base: string = 'main',
): Promise<'ok' | 'err'> => {
  try {
    // Get files that differ from base branch/commit (excluding deleted files)
    const { stdout, stderr } = await execAsync(
      `git diff --name-only ${base} --diff-filter=d`,
    );

    if (stderr !== '') {
      console.error('Git error:', stderr);
      return 'err';
    }

    // Parse git diff output
    const files = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

    if (files.length === 0) {
      console.log(`No files differ from ${base}`);
      return 'ok';
    }

    console.log(`Formatting files that differ from ${base}:`, files);

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
            console.log(`Skipping ignored file: ${filePath}`);
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
            console.log(`Formatted: ${filePath}`);
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
  } catch (error) {
    console.error('Error in formatDiffFrom:', error);
    return 'err';
  }
};
