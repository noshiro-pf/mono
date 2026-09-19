#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { Obj } from 'ts-data-forge';
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

export const applyRulesets = async (): Promise<void> => {
  const rulesets = await readRulesetFiles();

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

  for (const ruleset of rulesetsToCreate) {
    await createRuleset({
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

  // update local ruleset files
  {
    const rulesetsResult = await getAllRulesets();

    for (const rule of rulesetsResult) {
      const content = await getRuleset(rule.id);

      const str = JSON.stringify(
        Obj.pick(content, rulesetKeysToPick),
        undefined,
        2,
      );

      // `settingsFilePath` が `rulesetsDir` の直下であることを確かめている。
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(settingsFilePath(rulesetsDir, rule.name), str);
    }

    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyRulesets();
}
