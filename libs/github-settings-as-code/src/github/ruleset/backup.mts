#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { Obj } from 'ts-data-forge';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { rulesetsDir } from '../constants.mjs';
import { settingsFilePath } from '../settings-file-path.mjs';
import { getAllRulesets, getRuleset } from './api/index.mjs';
import { rulesetKeysToPick } from './constants.mjs';

/**
 * ruleset の現在値を宣言ファイルへ撮り直す。
 *
 * live に無い宣言は消さない。ディレクトリごと作り直すと、宣言してあるのに
 * まだ apply していない ruleset と、README のような同居ファイルまで消える。
 * 宣言だけあって live に無いものは drift 検査が報せる。
 */
export const backupRulesets = async (fmt: boolean = true): Promise<void> => {
  const rulesetsResult = await getAllRulesets();

  for (const rule of rulesetsResult) {
    const content = await getRuleset(rule.id);

    // `settingsFilePath` が `rulesetsDir` の直下であることを確かめている。
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      settingsFilePath(rulesetsDir, rule.name),
      JSON.stringify(Obj.pick(content, rulesetKeysToPick), undefined, 2),
    );
  }

  if (fmt) {
    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupRulesets();
}
