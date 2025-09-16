import 'ts-repo-utils';
import { rulesetsDir } from '../constants.mjs';
import {
  createRuleset,
  getAllRulesets,
  getRuleset,
  updateRuleset,
} from './api/index.mjs';
import { backupRulesets } from './backup.mjs';
import {
  readRulesetBackupFiles,
  readRulesetFiles,
} from './read-rule-set-contents.mjs';

await backupRulesets(false);

const rulesets = await readRulesetFiles();

const backupIds: ReadonlySet<number> = await readRulesetBackupFiles().then(
  (rs) => new Set(rs.map((r) => r.id)),
);

const rulesetsToUpdate = rulesets.filter((r) => backupIds.has(r.id));
const rulesetsToCreate = rulesets.filter((r) => !backupIds.has(r.id));

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

    await fs.writeFile(
      path.resolve(rulesetsDir, `${rule.name}.json`),
      JSON.stringify(content, undefined, 2),
    );
  }

  await $('npm run fmt');
}
