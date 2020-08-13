import { exec } from 'child_process';
import { promisify } from 'util';
import { monoRootAbsolutePath } from './get_mono_root_path';

const execp = promisify(exec);

type FileName = string;

const commands = {
  gitAddAll: 'git add .',
  gitDiff: (commitId?: string) =>
    `git diff --name-only --diff-filter=ACMTUXB --staged ${commitId ?? ''}`,
};

export const gitAddAll = async (): Promise<void> => {
  const { stderr, stdout } = await execp(commands.gitAddAll, {
    cwd: monoRootAbsolutePath,
  });

  if (stderr !== '') {
    console.log(stderr);
  }
  if (stdout !== '') {
    console.log(stdout);
  }
};

export const gitDiff = async (fromCommitId: string): Promise<FileName[]> => {
  const { stdout, stderr } = await execp(commands.gitDiff(fromCommitId), {
    cwd: monoRootAbsolutePath,
  });

  if (stderr !== '') {
    console.log(stderr);
  }

  return stdout.split('\n');
};
