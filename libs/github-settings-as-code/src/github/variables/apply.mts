#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as t from 'ts-fortress';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import { settingsJsonName, variablesDir } from '../constants.mjs';
import {
  createRepoVariable,
  listRepoVariables,
  updateRepoVariable,
} from './api/index.mjs';
import { backupVariables } from './backup.mjs';
import {
  assertVariableNamesAreValid,
  RepositoryVariables,
} from './constants.mjs';

/**
 * `repo-settings/variables/settings.json` を Settings > Secrets and variables >
 * Actions > Variables に反映する。
 *
 * ruleset や environment と同じく、**宣言に無い変数は消さない。** 消したい
 * ときは宣言から外したうえで GitHub 側でも消す。 apply が片付けてしまうと、
 * 誰かが GUI で足したものが「いつの間にか無くなる」ことになり、`bk/` に
 * 現れて気づくという drift の見え方が働かなくなる。
 */
export const applyVariables = async (): Promise<void> => {
  await backupVariables(false);

  const variables = await readSettings();

  // 1 本目を送る前に、全部の名前を見る。
  assertVariableNamesAreValid(variables);

  const existing: ReadonlySet<string> = await listRepoVariables().then(
    (vs) => new Set(vs.map((v) => v.name)),
  );

  for (const [name, value] of Object.entries(variables)) {
    await (existing.has(name)
      ? updateRepoVariable({ name, value })
      : createRepoVariable({ name, value }));
  }

  // `bk/` は backup 側が makeEmptyDir から作り直す。整形もそこで走る。
  //
  // `settings.json` の方は書き戻さない。他の target と違って live は宣言の
  // 上位集合になりうるので、書き戻すと宣言していない変数まで宣言に採り込んで
  // しまう。宣言は手で書くもので、 `bk/` がその答え合わせをする。
  await backupVariables();
};

const readSettings = async (): Promise<RepositoryVariables> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const settingsText = await fs.readFile(
    path.resolve(variablesDir, settingsJsonName),
    { encoding: 'utf8' },
  );

  const validationResult = RepositoryVariables.validate(
    JSON.parse(settingsText),
  );

  if (Result.isErr(validationResult)) {
    throw new Error(
      t.validationErrorsToMessages(validationResult.value).join('\n'),
    );
  }

  return validationResult.value;
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyVariables();
}
