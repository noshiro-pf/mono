#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { clearJsonFilesIn } from '../clear-json-files.mjs';
import { pagesSettingsDir, settingsJsonName } from '../constants.mjs';
import { getPagesSettings } from './api/index.mjs';

/**
 * Settings > Pages の現在値を宣言ファイルへ撮り直す。
 *
 * **Pages が無効なら宣言も消える。** 他のターゲットと同じ規則にしてある — 撮り
 * 直したあとに在るものが live から取れたものそのもの、という性質を、ここだけ
 * 崩さない。無効になったことが `git status` に削除として出る。
 *
 * 無効化と読み取り失敗を区別できないという弱点は残るが、`getPagesSettings` が
 * `undefined` を返すのは 404 のときだけで、それ以外の失敗は例外になる。消えた
 * 宣言はコミットしなければ失われない。
 */
export const backupPagesSettings = async (
  fmt: boolean = true,
): Promise<void> => {
  const settings = await getPagesSettings();

  await clearJsonFilesIn(pagesSettingsDir);

  if (settings === undefined) {
    console.warn(
      'GitHub Pages is not enabled for this repository; the declaration was removed.',
    );

    if (fmt) {
      await formatUncommittedFiles();
    }

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
