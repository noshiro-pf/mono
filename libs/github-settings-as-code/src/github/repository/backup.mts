#!/usr/bin/env node
import 'dotenv/config';
import { Obj } from 'ts-data-forge';
import { formatUncommittedFiles, makeEmptyDir } from 'ts-repo-utils';
import {
  repositorySettingsDir,
  repositorySettingsJsonName,
} from '../constants.mjs';
import { getRepositorySettings } from './api/index.mjs';
import { repositoryKeysToPick } from './constants.mjs';

const backupDir = path.resolve(repositorySettingsDir, './bk');

export const backupRepositorySettings = async (
  fmt: boolean = true,
): Promise<void> => {
  await makeEmptyDir(backupDir);

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
    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupRepositorySettings();
}
