#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { clearJsonFilesIn } from '../clear-json-files.mjs';
import { environmentsDir } from '../constants.mjs';
import { settingsFilePath } from '../settings-file-path.mjs';
import { getAllEnvironments } from './api/index.mjs';

/**
 * Settings > Environments の現在値を宣言ファイルへ撮り直す。
 *
 * ruleset と同じく、先に直下の `*.json` を消してから書く。理由は
 * {@link clearJsonFilesIn} を参照。
 */
export const backupEnvironments = async (
  fmt: boolean = true,
): Promise<void> => {
  const environments = await getAllEnvironments();

  await clearJsonFilesIn(environmentsDir);

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
