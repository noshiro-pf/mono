import { type ExecException } from 'node:child_process';
import { Result } from 'ts-data-forge';
import '../node-global.mjs';
import { $ } from './exec-async.mjs';

/**
 * Get the git repository root directory
 */
export const getGitRoot = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<Result<string, ExecException | Readonly<{ message: string }>>> => {
  const result = await $('git rev-parse --show-toplevel', {
    silent: options?.silent ?? false,
  });

  if (Result.isErr(result)) {
    return result;
  }

  return Result.ok(result.value.stdout.trim());
};

/**
 * Get untracked files from the working tree (files not added to git). Runs `git
 * ls-files --others --exclude-standard [--deleted]`
 */
export const getUntrackedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> =>
  cmdResultToFiles({
    cmd: `git ls-files --others --exclude-standard`,
    cmdOptionToExcludeDeleted: '',
    cmdOptionToIncludeDeleted: '--deleted',
    options,
  });

/**
 * Get modified files from the working tree (files that have been changed but
 * not staged). Runs `git diff --name-only [--diff-filter=d]`
 */
export const getModifiedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> =>
  cmdResultToFiles({
    cmd: `git diff --name-only`,
    cmdOptionToExcludeDeleted: '--diff-filter=d', // lower case 'd' means exclude deleted files
    cmdOptionToIncludeDeleted: '',
    options,
  });

/**
 * Get files that are staged for commit (files added with git add). Runs `git
 * diff --staged --name-only [--diff-filter=d]`
 */
export const getStagedFiles = async (
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>,
): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> =>
  cmdResultToFiles({
    cmd: `git diff --staged --name-only`,
    cmdOptionToExcludeDeleted: '--diff-filter=d', // lower case 'd' means exclude deleted files
    cmdOptionToIncludeDeleted: '',
    options,
  });

/**
 * Get files that differ from the specified base branch or commit. Runs `git
 * diff --name-only <base> [--diff-filter=d]`
 */
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
> =>
  cmdResultToFiles({
    cmd: `git diff --name-only ${base}`,
    cmdOptionToExcludeDeleted: '--diff-filter=d',
    cmdOptionToIncludeDeleted: '',
    options,
  });

const cmdResultToFiles = async ({
  cmd,
  cmdOptionToExcludeDeleted,
  cmdOptionToIncludeDeleted,
  options,
}: Readonly<{
  cmd: string;
  cmdOptionToExcludeDeleted: string;
  cmdOptionToIncludeDeleted: string;
  options?: Readonly<{
    /** @default true */
    excludeDeleted?: boolean;
    /** @default false */
    silent?: boolean;
  }>;
}>): Promise<
  Result<readonly string[], ExecException | Readonly<{ message: string }>>
> => {
  // Get git root directory
  const gitRootResult = await getGitRoot({ silent: options?.silent ?? false });

  if (Result.isErr(gitRootResult)) {
    return gitRootResult;
  }

  const gitRoot = gitRootResult.value;

  const result = await $(
    [
      cmd,
      (options?.excludeDeleted ?? true)
        ? cmdOptionToExcludeDeleted
        : cmdOptionToIncludeDeleted,
    ]
      .filter((s) => s !== '')
      .join(' '),
    { silent: options?.silent ?? false },
  );

  if (Result.isErr(result)) {
    return result;
  }

  const { stdout } = result.value;

  // Parse git output and convert to absolute paths
  const files = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((relativePath) => path.join(gitRoot, relativePath));

  return Result.ok(files);
};
