#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { Obj } from 'ts-data-forge';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { clearJsonFilesIn } from '../clear-json-files.mjs';
import { rulesetsDir } from '../constants.mjs';
import { settingsFilePath } from '../settings-file-path.mjs';
import { getAllRulesets, getRuleset } from './api/index.mjs';
import { rulesetKeysToPick } from './constants.mjs';

/**
 * ruleset の現在値を宣言ファイルへ撮り直す。
 *
 * 先に直下の `*.json` を消してから書くので、撮り直したあとにそこに在るものが
 * live から取れたものそのものになる。取れなかった ruleset は `git status` に
 * 削除として現れる。理由は {@link clearJsonFilesIn} を参照。
 */
export const backupRulesets = async (fmt: boolean = true): Promise<void> => {
  const rulesetsResult = await getAllRulesets();

  // 取得がすべて終わってから消す。途中で失敗したときに、宣言だけ消えて何も
  // 書かれていない状態にしないため。
  const contents = await Promise.all(
    rulesetsResult.map(async (rule) => ({
      name: rule.name,
      content: await getRuleset(rule.id),
    })),
  );

  await clearJsonFilesIn(rulesetsDir);

  for (const { name, content } of contents) {
    // `settingsFilePath` が `rulesetsDir` の直下であることを確かめている。
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      settingsFilePath(rulesetsDir, name),
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
