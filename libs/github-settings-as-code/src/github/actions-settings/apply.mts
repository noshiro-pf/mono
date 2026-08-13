#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { validationErrorsToMessages } from 'ts-fortress';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  Result,
} from 'ts-repo-utils';
import { actionsSettingsDir, settingsJsonName } from '../constants.mjs';
import { getActionsSettings, setActionsSettings } from './api/index.mjs';
import { backupActionsSettings } from './backup.mjs';
import { ActionsSettings } from './constants.mjs';

/** `repo-settings/actions-settings/settings.json` を Settings > Actions > General に反映する。 */
export const applyActionsSettings = async (): Promise<void> => {
  await backupActionsSettings(false);

  const settings = await readSettings();

  await setActionsSettings(settings);

  // 反映後の実際の値でローカルのファイルを更新する
  {
    const applied = await getActionsSettings();

    const str = JSON.stringify(applied, undefined, 2);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(path.resolve(actionsSettingsDir, settingsJsonName), str);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.resolve(actionsSettingsDir, 'bk', settingsJsonName),
      str,
    );

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
      validationErrorsToMessages(validationResult.value).join('\n'),
    );
  }

  return validationResult.value;
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyActionsSettings();
}
