import { exec } from 'child_process';
import { promisify } from 'util';
import { organizeImportsAndRunPrettierWithIO } from './format_base';
import { pathResolverMaker } from './path_resolver_maker';

const gitCommitId = process.argv[2] ?? ''; // master
const rootDir = pathResolverMaker(__dirname)('../');

// const toAbsolutePath = (path: string): string =>
//   pathResolverMaker(rootDir)(path);

const execp = promisify(exec);

type FileName = string;

const commands = {
  gitAdd: 'git add .',
  gitDiff: `git diff --name-only --diff-filter=ACMTUXB --staged ${gitCommitId}`,
};

const gitAdd = async (): Promise<void> => {
  const { stderr, stdout } = await execp(commands.gitAdd, { cwd: rootDir });

  if (stderr !== '') {
    console.log(stderr);
  }
  if (stdout !== '') {
    console.log(stdout);
  }
};

const parseDiff = (stdout: string): FileName[] => stdout.split('\n');

const gitDiff = async (): Promise<FileName[]> => {
  const { stdout, stderr } = await execp(commands.gitDiff, { cwd: rootDir });

  if (stderr !== '') {
    console.log(stderr);
  }

  return parseDiff(stdout);
};

const filterChangedTsFiles = (updatedFiles: FileName[]): string[] =>
  updatedFiles.filter(
    (filename) => filename.endsWith('.ts') || filename.endsWith('.tsx')
  );

const main = async (): Promise<void> => {
  await gitAdd();

  const updatedFiles = await gitDiff();
  const tsFiles = filterChangedTsFiles(updatedFiles);
  // const tsFilesAbsolutePath = tsFiles.map(toAbsolutePath);

  console.log(`target files (${tsFiles.length} files):`);
  tsFiles.forEach((filename) => console.log(`- ${filename}`));

  const success = await organizeImportsAndRunPrettierWithIO(
    // tsFilesAbsolutePath
    tsFiles
  );
  if (!success) {
    console.error(
      'some errors occurred in organizeImportsAndRunPrettierWithIO'
    );
  }

  await gitAdd();
};

main().catch((err) => console.error(err));
