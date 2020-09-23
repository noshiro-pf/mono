import { filterTsFiles, printTargetFiles } from './formatter_common';
import { organizeImportsAndRunPrettierWithIO } from './format_base';
import { gitDiff, gitUnTrackedFiles } from './get_changed_files';

const uniq = (array: string[]): string[] => Array.from(new Set(array));

const main = async (): Promise<void> => {
  const gitCommitId = process.argv[2] ?? ''; // master

  const untrackedFiles = await gitUnTrackedFiles();
  const updatedFiles = await gitDiff(gitCommitId);
  const tsFiles = uniq(filterTsFiles(untrackedFiles.concat(updatedFiles)));

  printTargetFiles(tsFiles);
  await organizeImportsAndRunPrettierWithIO(tsFiles);
};

main().catch((err) => console.error(err));
