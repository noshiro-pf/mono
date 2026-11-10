#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { Arr, Obj } from 'ts-data-forge';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { rulesetsDir } from '../constants.mjs';
import { settingsFilePath } from '../settings-file-path.mjs';
import {
  createRuleset,
  getAllRulesets,
  getRuleset,
  updateRuleset,
} from './api/index.mjs';
import { rulesetKeysToPick } from './constants.mjs';
import { readRulesetFiles } from './read-rule-set-contents.mjs';

/**
 * `repo-settings/rulesets/*.json` を Settings > Rules > Rulesets に反映する。
 * 宣言が一つも無ければ（ディレクトリが無い repository も含む）何もしない。
 */
export const applyRulesets = async (): Promise<void> => {
  const rulesets = await readRulesetFiles();

  if (!Arr.isNonEmpty(rulesets)) {
    return;
  }

  // 既にあるかどうかは live に訊く。以前はこの直前に走らせた backup の出力を
  // 読んでいたが、それは live の写しでしかなく、写した時点と送る時点のあいだに
  // 消えた ruleset を「更新できる」と誤らせる余地があった。
  const existingIds: ReadonlySet<number> = await getAllRulesets().then(
    (rs) => new Set(rs.map((r) => r.id)),
  );

  const rulesetsToUpdate = rulesets.filter((r) => existingIds.has(r.id));

  const rulesetsToCreate = rulesets.filter((r) => !existingIds.has(r.id));

  for (const ruleset of rulesetsToUpdate) {
    await updateRuleset({
      rulesetId: ruleset.id,
      payload: {
        bypass_actors: ruleset.bypass_actors,
        conditions: ruleset.conditions ?? undefined,
        enforcement: ruleset.enforcement,
        name: ruleset.name,
        rules: ruleset.rules,
        target: ruleset.target === 'repository' ? undefined : ruleset.target,
      },
    });
  }

  const mut_createdIds: number[] = [];

  for (const ruleset of rulesetsToCreate) {
    const createdId = await createRuleset({
      payload: {
        bypass_actors: ruleset.bypass_actors,
        conditions: ruleset.conditions ?? undefined,
        enforcement: ruleset.enforcement,
        name: ruleset.name,
        rules: ruleset.rules,
        target: ruleset.target === 'repository' ? undefined : ruleset.target,
      },
    });

    mut_createdIds.push(createdId);
  }

  // 書き戻すのは、いま送った ruleset だけ — 更新したものは宣言の id で、
  // 作ったものは GitHub が付けた id で特定する。宣言に無い ruleset（GUI で
  // 作られたもの、 organization の ruleset）まで書くと、 drift 検査が報せる
  // はずのものが宣言として取り込まれてしまう。名前では特定しない。親の
  // ruleset が同じ名前を持てるので、別物が同じファイルに書かれうる。
  const appliedIds: ReadonlySet<number> = new Set<number>([
    ...rulesetsToUpdate.map((r) => r.id),
    ...mut_createdIds,
  ]);

  // 反映後の実際の値で、送った ruleset のファイルを更新する。 GitHub が値を
  // 正規化したり受け付けなかったりしたものが diff に出る。一覧は読み直さず
  // id ごとに取る（一覧はページ分割され、親の ruleset も含む）。全部取って
  // から書くので、途中で取得に失敗しても一部だけ書き換わることはない。
  {
    const contents = await Promise.all(Array.from(appliedIds, getRuleset));

    for (const content of contents) {
      const str = JSON.stringify(
        Obj.pick(content, rulesetKeysToPick),
        undefined,
        2,
      );

      // `settingsFilePath` が `rulesetsDir` の直下であることを確かめている。
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(settingsFilePath(rulesetsDir, content.name), str);
    }

    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyRulesets();
}
