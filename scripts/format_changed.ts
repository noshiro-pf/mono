import { organizeImportsAndRunPrettierWithIO } from './format_base';
import { gitDiff, gitUnTrackedFiles } from './get_changed_files';
import { monoRootAbsolutePath } from './get_mono_root_path';
import { pathResolverMaker } from './path_resolver_maker';

const toAbsolutePath = (path: string): string =>
  pathResolverMaker(monoRootAbsolutePath)(path);

type FileName = string;

const isTsFileName = (filename: FileName): boolean =>
  (filename.endsWith('.ts') || filename.endsWith('.tsx')) &&
  !filename.endsWith('.d.ts');

const uniq = (array: string[]): string[] => Array.from(new Set(array));

const main = async (): Promise<void> => {
  const gitCommitId = process.argv[2] ?? ''; // master

  const untrackedFiles = await gitUnTrackedFiles();
  const updatedFiles = await gitDiff(gitCommitId);
  const tsFiles = uniq(
    untrackedFiles.concat(updatedFiles).filter(isTsFileName).map(toAbsolutePath)
  );

  console.log(`target files (${tsFiles.length} files):`);
  tsFiles.forEach((filename) => console.log(`- ${filename}`));

  const success = await organizeImportsAndRunPrettierWithIO(tsFiles);
  if (!success) {
    console.error(
      'some errors occurred in organizeImportsAndRunPrettierWithIO'
    );
  }
};

main().catch((err) => console.error(err));
