import * as fs from 'node:fs/promises';
import * as t from 'ts-fortress';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import { rulesetsDir } from '../constants.mjs';
import { listJsonFilesIn } from '../list-json-files.mjs';
import { RulesetPicked } from './constants.mjs';

export const readRulesetFiles = async (): Promise<readonly RulesetPicked[]> =>
  readRulesetFilesIn(rulesetsDir);

/**
 * `dir` の直下の宣言（`*.json`）を読んで検証する。テストが一時ディレクトリを
 * 渡せるように、ディレクトリを引数に取る。
 */
export const readRulesetFilesIn = async (
  dir: string,
): Promise<readonly RulesetPicked[]> => {
  const files = await listJsonFilesIn(dir);

  const rulesetFileContents: readonly string[] = await Promise.all(
    files.map((file) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFile(file, { encoding: 'utf8' }),
    ),
  );

  const validationResults = rulesetFileContents.map((rule) =>
    RulesetPicked.validate(JSON.parse(rule)),
  );

  const mut_values: RulesetPicked[] = [];

  for (const r of validationResults) {
    if (Result.isErr(r)) {
      throw new Error(t.validationErrorsToMessages(r.value).join('\n'));
    }

    mut_values.push(r.value);
  }

  return mut_values;
};

if (isDirectlyExecuted(import.meta.url)) {
  await readRulesetFiles();
}
