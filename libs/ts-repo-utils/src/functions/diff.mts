import { type ExecException } from 'node:child_process';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';

/**
 * Get files that have been changed (git status).
 */
export const getUntrackedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> => {
  // Get changed files from git status
  const result = await $('git status --porcelain');

  if (Result.isErr(result)) {
    return result;
  }

  const { stdout } = result.value;

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
        file !== undefined &&
        ((options?.excludeDeleted ?? true)
          ? !stdout.includes(`D  ${file}`)
          : true),
    );

  return Result.ok(files);
};

/**
 * Get files that differ from the specified base branch or commit
 */
export const getDiffFrom = async (
  base: string,
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> => {
  // Get files that differ from base branch/commit (excluding deleted files)
  const result = await $(
    `git diff --name-only ${base} ${(options?.excludeDeleted ?? true) ? '--diff-filter=d' : ''}`,
  );

  if (Result.isErr(result)) {
    return result;
  }

  const { stdout } = result.value;

  // Parse git diff output
  const files = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');

  return Result.ok(files);
};
