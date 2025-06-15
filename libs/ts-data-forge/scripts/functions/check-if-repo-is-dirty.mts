import '../node-global.mjs';

/**
 * Gets the git status of the repository.
 * @returns An object containing status information.
 */
const getGitStatus = async (): Promise<{
  isDirty: boolean;
  stdout: string;
}> => {
  const res = await $('git status --porcelain');

  if (res.type === 'error') {
    throw new Error(`Failed to get git status: ${res.exception.message}`);
  }

  return {
    isDirty: res.stdout.trim() !== '',
    stdout: res.stdout,
  };
};

/**
 * Checks if the repository is dirty and exits with code 1 if it is.
 * @throws Error if git command fails.
 */
export const checkIfRepoIsDirty = async (): Promise<void> => {
  try {
    const status = await getGitStatus();

    if (!status.isDirty) {
      echo('Repo is clean\n');
      return;
    }

    echo('Repo is dirty\n');
    echo('Changed files:\n');
    echo(status.stdout);

    // Show files not tracked by git and unstaged changes
    const addResult = await $('git add -N .');
    if (addResult.type === 'error') {
      echo('Warning: Failed to add untracked files for diff\n');
    }

    const diffResult = await $('git diff');
    if (diffResult.type === 'error') {
      echo('Warning: Failed to show diff\n');
    }

    process.exit(1);
  } catch (error) {
    echo(`Error checking repository status: ${String(error)}\n`);
    process.exit(1);
  }
};

/**
 * Checks if the repository has uncommitted changes.
 * @returns True if the repo is dirty, false otherwise.
 * @throws Error if git command fails.
 */
export const repoIsDirty = async (): Promise<boolean> => {
  const status = await getGitStatus();
  return status.isDirty;
};
