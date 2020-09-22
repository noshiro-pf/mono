import { filterTsFiles, printTargetFiles } from './formatter_common';
import { organizeImportsAndRunPrettierWithIO } from './format_base';
import { gitStagedFiles } from './get_changed_files';

const main = async (): Promise<void> => {
  const stagedFiles = await gitStagedFiles();
  const tsFiles = filterTsFiles(stagedFiles);

  printTargetFiles(tsFiles);

  await organizeImportsAndRunPrettierWithIO(tsFiles);
};

main().catch((err) => console.error(err));
