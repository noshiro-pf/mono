#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  makeEmptyDir,
} from 'ts-repo-utils';
import { actionsSettingsDir, settingsJsonName } from '../constants.mjs';
import { getActionsSettings } from './api/index.mjs';

const backupDir = path.resolve(actionsSettingsDir, './bk');

/** Settings > Actions > General の現在値を `bk/` に保存する。 */
export const backupActionsSettings = async (
  fmt: boolean = true,
): Promise<void> => {
  await makeEmptyDir(backupDir);

  const settings = await getActionsSettings();

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(backupDir, settingsJsonName),
    JSON.stringify(settings, undefined, 2),
  );

  if (fmt) {
    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupActionsSettings();
}
