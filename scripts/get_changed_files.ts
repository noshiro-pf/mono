import { exec } from 'child_process';
import { promisify } from 'util';
import { monoRootAbsolutePath } from './get_mono_root_path';

const execp = promisify(exec);

type FileName = string;

const commands = {
  gitUnStagedFiles: 'git ls-files -mo --exclude-standard',
  gitDiff: (commitId?: string) =>
    `git diff --name-only --diff-filter=ACMTUXB --staged ${commitId ?? ''}`,
};

export const gitUnTrackedFiles = async (): Promise<FileName[]> => {
  console.log(commands.gitUnStagedFiles);
  const { stdout, stderr } = await execp(commands.gitUnStagedFiles, {
    cwd: monoRootAbsolutePath,
  });

  if (stderr !== '') {
    console.log(stderr);
  }

  return stdout.split('\n');
};

export const gitDiff = async (fromCommitId: string): Promise<FileName[]> => {
  console.log(commands.gitDiff(fromCommitId));
  const { stdout, stderr } = await execp(commands.gitDiff(fromCommitId), {
    cwd: monoRootAbsolutePath,
  });

  if (stderr !== '') {
    console.log(stderr);
  }

  return stdout.split('\n');
};
