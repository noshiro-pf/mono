import { Obj } from 'ts-data-forge';
import 'ts-repo-utils';
import { mkdirClean } from '../../utils.mjs';
import {
  repositorySettingsDir,
  repositorySettingsJsonName,
} from '../constants.mjs';
import { getRepositorySettings } from './api/index.mjs';
import { repositoryKeysToPick } from './constants.mjs';

const backupDir = path.resolve(repositorySettingsDir, './bk');

export const backupRepositorySettings = async (fmt: boolean = true) => {
  await mkdirClean(backupDir);

  const repositorySettings = await getRepositorySettings();

  await fs.writeFile(
    path.resolve(backupDir, repositorySettingsJsonName),
    JSON.stringify(
      Obj.pick(repositorySettings, repositoryKeysToPick),
      undefined,
      2,
    ),
  );

  if (fmt) {
    await $('npm run fmt');
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupRepositorySettings();
}
