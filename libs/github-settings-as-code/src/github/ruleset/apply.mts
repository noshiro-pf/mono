#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { Arr, Obj } from 'ts-data-forge';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import {
  createRuleset,
  getAllRulesets,
  getRuleset,
  updateRuleset,
} from './api/index.mjs';
import { type RulesetPicked, rulesetKeysToPick } from './constants.mjs';
import { readRulesetFiles } from './read-rule-set-contents.mjs';

/**
 * `repo-settings/rulesets/*.json` を Settings > Rules > Rulesets に反映する。
 * 宣言が一つも無ければ（ディレクトリが無い repository も含む）何もしない。
 *
 * 反映後の実際の値は、送った ruleset ごとに、送ってすぐ、その宣言を読んだ
 * ファイルへ書き戻す。 GitHub が値を正規化したり受け付けなかったりしたものが
 * diff に出る。
 *
 * - **書き戻し先は読んだファイル**で、名前から作ったパスではない。名前を変えた
 *   宣言を名前から書くと、同じ id を持つ元のファイルが残り、次の apply が一つの
 *   ruleset に二度更新を送る。
 * - **送ってすぐ書く。** 作った ruleset の id は GitHub が付けるもので、ファイルに
 *   書くまでは仮の id のまま残る。後の作成が失敗したときにまとめて書く前で
 *   止まると、次の apply がそれをもう一度作る。
 * - 書き戻すのは送った ruleset だけ。宣言に無い ruleset（GUI で作られたもの）
 *   まで書くと、 drift 検査が報せるはずのものが宣言として取り込まれてしまう。
 *   値は一覧から読まず id ごとに取る。
 */
export const applyRulesets = async (): Promise<void> => {
  const declarations = await readRulesetFiles();

  if (!Arr.isNonEmpty(declarations)) {
    return;
  }

  // 既にあるかどうかは live に訊く。以前はこの直前に走らせた backup の出力を
  // 読んでいたが、それは live の写しでしかなく、写した時点と送る時点のあいだに
  // 消えた ruleset を「更新できる」と誤らせる余地があった。
  const existingIds: ReadonlySet<number> = await getAllRulesets().then(
    (rs) => new Set(rs.map((r) => r.id)),
  );

  const toUpdate = declarations.filter(({ value }) =>
    existingIds.has(value.id),
  );

  const toCreate = declarations.filter(
    ({ value }) => !existingIds.has(value.id),
  );

  try {
    for (const { file, value: ruleset } of toUpdate) {
      await updateRuleset({
        rulesetId: ruleset.id,
        payload: payloadOf(ruleset),
      });

      await writeBack(file, ruleset.id);
    }

    for (const { file, value: ruleset } of toCreate) {
      const createdId = await createRuleset({ payload: payloadOf(ruleset) });

      await writeBack(file, createdId);
    }
  } finally {
    await formatUncommittedFiles();
  }
};

const payloadOf = (ruleset: RulesetPicked): RulesetPayload =>
  ({
    bypass_actors: ruleset.bypass_actors,
    conditions: ruleset.conditions ?? undefined,
    enforcement: ruleset.enforcement,
    name: ruleset.name,
    rules: ruleset.rules,
    target: ruleset.target === 'repository' ? undefined : ruleset.target,
  }) as const;

type RulesetPayload = Parameters<typeof createRuleset>[0]['payload'];

/** The ruleset `id` as GitHub has it now, into the file it was declared in. */
const writeBack = async (file: string, id: number): Promise<void> => {
  const content = await getRuleset(id);

  // `file` は `rulesetsDir` の直下で `listJsonFilesIn` が見つけたもの。
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    file,
    JSON.stringify(Obj.pick(content, rulesetKeysToPick), undefined, 2),
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyRulesets();
}
