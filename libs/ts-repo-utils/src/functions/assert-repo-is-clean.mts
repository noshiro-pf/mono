import { Result } from 'ts-data-forge';
import '../node-global.mjs';

/**
 * Checks if the repository has uncommitted changes.
 * @returns True if the repo is dirty, false otherwise.
 * @throws Error if git command fails.
 */
export const repoIsDirty = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<boolean> => {
  const status = await getGitStatus({ silent: options?.silent ?? false });
  return status.isDirty;
};

/**
 * Checks if the repository is clean and exits with code 1 if it is dirty.
 * Shows git status and diff output before exiting.
 */
export const assertRepoIsClean = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<void> => {
  try {
    const status = await getGitStatus({ silent: options?.silent ?? false });

    if (!status.isDirty) {
      echo('Repo is clean\n');
      return;
    }

    echo('Repo is dirty\n');
    echo('Changed files:\n');
    echo(status.stdout);

    // Show files not tracked by git and unstaged changes
    const addResult = await $('git add -N .', {
      silent: options?.silent ?? false,
    });
    if (Result.isErr(addResult)) {
      echo('Warning: Failed to add untracked files for diff\n');
    }

    const diffResult = await $('git diff', {
      silent: options?.silent ?? false,
    });
    if (Result.isErr(diffResult)) {
      echo('Warning: Failed to show diff\n');
    }

    process.exit(1);
  } catch (error) {
    echo(`Error checking repository status: ${String(error)}\n`);
    process.exit(1);
  }
};

/**
 * Gets the git status of the repository.
 * @returns An object containing status information.
 */
const getGitStatus = async (
  options?: Readonly<{ silent?: boolean }>,
): Promise<{
  isDirty: boolean;
  stdout: string;
}> => {
  const res = await $('git status --porcelain', {
    silent: options?.silent ?? false,
  });

  if (Result.isErr(res)) {
    throw new Error(`Failed to get git status: ${res.value.message}`);
  }

  const { stdout } = res.value;

  return {
    isDirty: stdout.trim() !== '',
    stdout,
  };
};
