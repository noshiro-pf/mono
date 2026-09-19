#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { environmentsDir } from '../constants.mjs';
import { settingsFilePath } from '../settings-file-path.mjs';
import { getAllEnvironments } from './api/index.mjs';

/**
 * Settings > Environments の現在値を宣言ファイルへ撮り直す。
 *
 * ruleset と同じく、live に無い宣言は消さない。
 */
export const backupEnvironments = async (
  fmt: boolean = true,
): Promise<void> => {
  const environments = await getAllEnvironments();

  for (const environment of environments) {
    // `settingsFilePath` が `environmentsDir` の直下であることを確かめている。
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      settingsFilePath(environmentsDir, environment.name),
      JSON.stringify(environment, undefined, 2),
    );
  }

  if (fmt) {
    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupEnvironments();
}
