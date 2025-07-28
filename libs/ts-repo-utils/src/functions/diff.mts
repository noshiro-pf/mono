import { type ExecException } from 'node:child_process';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';

/** Get files that have been changed (git status). */
export const getUntrackedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> => {
  // Get changed files from git status
  const result = await $(
    [
      `git ls-files --others --exclude-standard`,
      // Append '--deleted' to include deleted files only if excludeDeleted is explicitly false
      (options?.excludeDeleted ?? true) ? '' : '--deleted',
    ]
      .filter((s) => s !== '')
      .join(' '),
    { silent: options?.silent ?? false },
  );

  if (Result.isErr(result)) {
    return result;
  }

  const { stdout } = result.value;

  // Parse git status output
  const files = stdout
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s !== '');

  return Result.ok(files);
};

/** Get files that differ from the specified base branch or commit */
export const getDiffFrom = async (
  base: string,
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> => {
  // Get files that differ from base branch/commit (excluding deleted files)
  const result = await $(
    [
      `git diff --name-only`,
      base,
      (options?.excludeDeleted ?? true) ? '--diff-filter=d' : '',
    ]
      .filter((s) => s !== '')
      .join(' '),
    { silent: options?.silent ?? false },
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
