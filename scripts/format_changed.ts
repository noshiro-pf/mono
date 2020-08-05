import { exec } from 'child_process';
import * as util from 'util';
import { organizeImportsAndRunPrettierWithIO } from './format_base';

const gitCommitId = process.argv[2] ?? ''; // master

const execp = util.promisify(exec);

type FileName = string;

const commands = {
  gitAdd: 'git add .',
  gitDiff: `git diff --name-only --diff-filter=ACMTUXB --relative --staged ${gitCommitId}`
};

const gitAdd = async () => {
  const { stderr, stdout } = await execp(commands.gitAdd);

  if (stderr !== '') {
    console.log(stderr);
  }
  if (stdout !== '') {
    console.log(stdout);
  }
};

const parseDiff = (stdout: string): FileName[] => {
  const lines = stdout.split('\n');
  return lines;
};

const gitDiff = async (): Promise<FileName[]> => {
  const { stdout, stderr } = await execp(commands.gitDiff);

  if (stderr !== '') {
    console.log(stderr);
  }

  return parseDiff(stdout);
};

const filterChangedTsFiles = (updatedFiles: FileName[]) =>
  updatedFiles.filter(
    filename => filename.endsWith('.ts') || filename.endsWith('.tsx')
  );

const main = async () => {
  await gitAdd();

  const updatedFiles = await gitDiff();
  const tsFiles = filterChangedTsFiles(updatedFiles);

  console.log(`target files (${tsFiles.length} files):`);
  tsFiles.forEach(filename => console.log(`- ${filename}`));

  await organizeImportsAndRunPrettierWithIO(tsFiles);

  await gitAdd();
};

main();
