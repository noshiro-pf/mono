#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { actionsSettingsDir, settingsJsonName } from '../constants.mjs';
import { getActionsSettings } from './api/index.mjs';

/** Settings > Actions > General の現在値を宣言ファイルへ撮り直す。 */
export const backupActionsSettings = async (
  fmt: boolean = true,
): Promise<void> => {
  const settings = await getActionsSettings();

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(actionsSettingsDir, settingsJsonName),
    JSON.stringify(settings, undefined, 2),
  );

  if (fmt) {
    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupActionsSettings();
}
