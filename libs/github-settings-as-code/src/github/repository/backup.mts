#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Obj } from 'ts-data-forge';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { repositorySettingsDir, settingsJsonName } from '../constants.mjs';
import { getRepositorySettings } from './api/index.mjs';
import { repositoryKeysToPick } from './constants.mjs';

export const backupRepositorySettings = async (
  fmt: boolean = true,
): Promise<void> => {
  const repositorySettings = await getRepositorySettings();

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(repositorySettingsDir, settingsJsonName),
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
