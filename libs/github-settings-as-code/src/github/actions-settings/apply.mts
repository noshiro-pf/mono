#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as t from 'ts-fortress';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  pathExists,
  Result,
} from 'ts-repo-utils';
import { actionsSettingsDir, settingsJsonName } from '../constants.mjs';
import { getActionsSettings, setActionsSettings } from './api/index.mjs';
import { ActionsSettings } from './constants.mjs';

/**
 * `repo-settings/actions-settings/settings.json` を Settings > Actions > General に反映する。
 * 設定ファイルを置いていない repository では何もしない（pages と同じ理由）。
 */
export const applyActionsSettings = async (): Promise<void> => {
  if (!(await pathExists(path.resolve(actionsSettingsDir, settingsJsonName)))) {
    return;
  }

  const settings = await readSettings();

  await setActionsSettings(settings);

  // 反映後の実際の値でローカルのファイルを更新する
  {
    const applied = await getActionsSettings();

    const str = JSON.stringify(applied, undefined, 2);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(path.resolve(actionsSettingsDir, settingsJsonName), str);

    await formatUncommittedFiles();
  }
};

const readSettings = async (): Promise<ActionsSettings> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const settingsText = await fs.readFile(
    path.resolve(actionsSettingsDir, settingsJsonName),
    { encoding: 'utf8' },
  );

  const validationResult = ActionsSettings.validate(JSON.parse(settingsText));

  if (Result.isErr(validationResult)) {
    throw new Error(
      t.validationErrorsToMessages(validationResult.value).join('\n'),
    );
  }

  return validationResult.value;
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyActionsSettings();
}
