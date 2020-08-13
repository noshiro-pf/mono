import { organizeImportsAndRunPrettierWithIO } from './format_base';
import { gitDiff, gitAddAll } from './get_changed_files';

// const toAbsolutePath = (path: string): string =>
//   pathResolverMaker(rootDir)(path);

type FileName = string;

const isTsFileName = (filename: FileName): boolean =>
  filename.endsWith('.ts') || filename.endsWith('.tsx');

const main = async (): Promise<void> => {
  const gitCommitId = process.argv[2] ?? ''; // master
  await gitAddAll();

  const updatedFiles = await gitDiff(gitCommitId);
  const tsFiles = updatedFiles.filter(isTsFileName);
  // .map(toAbsolutePath);

  console.log(`target files (${tsFiles.length} files):`);
  tsFiles.forEach((filename) => console.log(`- ${filename}`));

  const success = await organizeImportsAndRunPrettierWithIO(tsFiles);
  if (!success) {
    console.error(
      'some errors occurred in organizeImportsAndRunPrettierWithIO'
    );
  }

  await gitAddAll();
};

main().catch((err) => console.error(err));
