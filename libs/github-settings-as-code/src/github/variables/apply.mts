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
 * 誰かが GUI で足したものが「いつの間にか無くなる」ことになり、drift 検査が
 * 報せるという見え方が働かなくなる。
 */
export const applyVariables = async (): Promise<void> => {
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

  // ここで live を読み直して書き戻すことはしない。 backup は live をそのまま
  // 宣言に写す操作で、 live は宣言の上位集合になりうる — apply の締めに呼ぶと、
  // 宣言していない変数まで黙って宣言に入る。送った値は宣言そのものなので、
  // 書き戻して得られるものも無い。現在値を取り込みたいときは backup を明示的に
  // 実行する。
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
