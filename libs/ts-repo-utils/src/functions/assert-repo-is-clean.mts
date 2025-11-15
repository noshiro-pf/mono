import { Result } from 'ts-data-forge';
import '../node-global.mjs';

/**
 * Checks if the repository has uncommitted changes.
 *
 * @returns True if the repo is dirty, false otherwise.
 * @throws Error if git command fails.
 */
export const repoIsDirty = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<boolean> => {
  const status = await getGitStatus({ silent: options?.silent ?? false });

  if (Result.isErr(status)) {
    throw new Error(`Failed to get git status: ${status.value}`);
  }

  return status.value.isDirty;
};

/**
 * Checks if the repository is clean and exits with code 1 if it is dirty. Shows
 * git status and diff output before exiting.
 */
export const assertRepoIsClean = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<void> => {
  const silent = options?.silent ?? false;

  const conditionalEcho = silent ? () => {} : echo;

  const gitStatusResult = await getGitStatus({ silent });

  if (Result.isErr(gitStatusResult)) {
    conditionalEcho(gitStatusResult.value);

    return;
  }

  const gitStatus = gitStatusResult.value;

  if (!gitStatus.isDirty) {
    conditionalEcho('Repo is clean\n');

    return;
  }

  conditionalEcho('Repo is dirty\n');

  conditionalEcho('Changed files:\n');

  conditionalEcho(gitStatus.stdout);

  // Show files not tracked by git and unstaged changes
  const addResult = await $('git add -N .', { silent });

  if (Result.isErr(addResult)) {
    conditionalEcho('Warning: Failed to add untracked files for diff\n');
  }

  const diffResult = await $('git diff', { silent });

  if (Result.isErr(diffResult)) {
    conditionalEcho('Warning: Failed to show diff\n');
  }

  process.exit(1);
};

/**
 * Gets the git status of the repository.
 *
 * @returns An object containing status information.
 */
const getGitStatus = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<
  Result<
    Readonly<{
      isDirty: boolean;
      stdout: string;
    }>,
    string
  >
> => {
  const res = await $('git status --porcelain', {
    silent: options?.silent ?? false,
  });

  if (Result.isErr(res)) {
    return Result.err(`Failed to get git status: ${res.value.message}`);
  }

  const { stdout } = res.value;

  return Result.ok({
    isDirty: stdout.trim() !== '',
    stdout,
  });
};
