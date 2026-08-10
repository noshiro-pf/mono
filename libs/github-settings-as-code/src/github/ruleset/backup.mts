#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Obj } from 'ts-data-forge';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  makeEmptyDir,
} from 'ts-repo-utils';
import { rulesetsDir } from '../constants.mjs';
import { getAllRulesets, getRuleset } from './api/index.mjs';
import { rulesetKeysToPick } from './constants.mjs';

const backupDir = path.resolve(rulesetsDir, './bk');

export const backupRulesets = async (fmt: boolean = true): Promise<void> => {
  await makeEmptyDir(backupDir);

  const rulesetsResult = await getAllRulesets();

  for (const rule of rulesetsResult) {
    const content = await getRuleset(rule.id);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.resolve(backupDir, `${rule.name}.json`),
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
