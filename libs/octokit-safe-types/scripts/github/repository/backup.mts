import 'ts-repo-utils';
import { mkdirClean } from '../../utils.mjs';
import {
  repositorySettingsDir,
  repositorySettingsJsonName,
} from '../constants.mjs';
import { getRepositorySettings } from './api/index.mjs';

const backupDir = path.resolve(repositorySettingsDir, './bk');

export const backupRepositorySettings = async (fmt: boolean = true) => {
  await mkdirClean(backupDir);

  const repositorySettings = await getRepositorySettings();

  await fs.writeFile(
    path.resolve(backupDir, repositorySettingsJsonName),
    JSON.stringify(repositorySettings, undefined, 2),
  );

  if (fmt) {
    await $('npm run fmt');
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupRepositorySettings();
}
