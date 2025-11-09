import { Obj } from 'ts-data-forge';
import 'ts-repo-utils';
import { mkdirClean } from '../../utils.mjs';
import { rulesetsDir } from '../constants.mjs';
import { getAllRulesets, getRuleset } from './api/index.mjs';
import { rulesetKeysToPick } from './constants.mjs';

const backupDir = path.resolve(rulesetsDir, './bk');

export const backupRulesets = async (fmt: boolean = true) => {
  await mkdirClean(backupDir);

  const rulesetsResult = await getAllRulesets();

  for (const rule of rulesetsResult) {
    const content = await getRuleset(rule.id);

    await fs.writeFile(
      path.resolve(backupDir, `${rule.name}.json`),
      JSON.stringify(Obj.pick(content, rulesetKeysToPick), undefined, 2),
    );
  }

  if (fmt) {
    await $('pnpm run fmt');
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupRulesets();
}
