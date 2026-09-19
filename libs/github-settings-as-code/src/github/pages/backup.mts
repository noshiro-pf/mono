#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { pagesSettingsDir, settingsJsonName } from '../constants.mjs';
import { getPagesSettings } from './api/index.mjs';

/**
 * Settings > Pages の現在値を宣言ファイルへ撮り直す。
 *
 * Pages が無効なら宣言はそのまま残す。消してしまうと「Pages を使う」という
 * 宣言が、一時的に無効だった日の backup で失われる。
 */
export const backupPagesSettings = async (
  fmt: boolean = true,
): Promise<void> => {
  const settings = await getPagesSettings();

  if (settings === undefined) {
    console.warn(
      'GitHub Pages is not enabled for this repository; skipping backup.',
    );

    return;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(pagesSettingsDir, settingsJsonName),
    JSON.stringify(settings, undefined, 2),
  );

  if (fmt) {
    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupPagesSettings();
}
