#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { validationErrorsToMessages } from 'ts-fortress';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  pathExists,
  Result,
} from 'ts-repo-utils';
import { pagesSettingsDir, settingsJsonName } from '../constants.mjs';
import { getPagesSettings, setPagesSettings } from './api/index.mjs';
import { PagesSettings } from './constants.mjs';

/**
 * `github/pages/settings.json` を Settings > Pages に反映する。
 *
 * 設定ファイルを置いていない repository では何もしない（ Pages を使わない
 * repository で誤って Pages を有効化しないため）。
 */
export const applyPagesSettings = async (): Promise<void> => {
  const settingsPath = path.resolve(pagesSettingsDir, settingsJsonName);

  if (!(await pathExists(settingsPath))) {
    return;
  }

  const settings = await readSettings(settingsPath);

  await setPagesSettings(settings);

  // 反映後の実際の値でローカルのファイルを更新する
  {
    const applied = await getPagesSettings();

    if (applied === undefined) {
      return;
    }

    const str = JSON.stringify(applied, undefined, 2);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(settingsPath, str);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.resolve(pagesSettingsDir, 'bk', settingsJsonName),
      str,
    );

    await formatUncommittedFiles();
  }
};

const readSettings = async (settingsPath: string): Promise<PagesSettings> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const settingsText = await fs.readFile(settingsPath, { encoding: 'utf8' });

  const validationResult = PagesSettings.validate(JSON.parse(settingsText));

  if (Result.isErr(validationResult)) {
    throw new Error(
      validationErrorsToMessages(validationResult.value).join('\n'),
    );
  }

  return validationResult.value;
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyPagesSettings();
}
