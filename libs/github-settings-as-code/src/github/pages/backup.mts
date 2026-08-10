#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  makeEmptyDir,
} from 'ts-repo-utils';
import { pagesSettingsDir, settingsJsonName } from '../constants.mjs';
import { getPagesSettings } from './api/index.mjs';

const backupDir = path.resolve(pagesSettingsDir, './bk');

/** Settings > Pages の現在値を `bk/` に保存する。 */
export const backupPagesSettings = async (
  fmt: boolean = true,
): Promise<void> => {
  await makeEmptyDir(backupDir);

  const settings = await getPagesSettings();

  if (settings === undefined) {
    console.warn(
      'GitHub Pages is not enabled for this repository; skipping backup.',
    );

    return;
  }

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
  await backupPagesSettings();
}
