import * as fs from 'node:fs/promises';
import * as t from 'ts-fortress';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import { environmentsDir } from '../constants.mjs';
import { listJsonFilesIn } from '../list-json-files.mjs';
import { EnvironmentSettings } from './constants.mjs';

export const readEnvironmentFiles = async (): Promise<
  readonly EnvironmentSettings[]
> => readEnvironmentFilesIn(environmentsDir);

/**
 * `dir` の直下の宣言（`*.json`）を読んで検証する。テストが一時ディレクトリを
 * 渡せるように、ディレクトリを引数に取る。
 */
export const readEnvironmentFilesIn = async (
  dir: string,
): Promise<readonly EnvironmentSettings[]> => {
  const files = await listJsonFilesIn(dir);

  const fileContents: readonly string[] = await Promise.all(
    files.map((file) =>
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFile(file, { encoding: 'utf8' }),
    ),
  );

  const validationResults = fileContents.map((content) =>
    EnvironmentSettings.validate(JSON.parse(content)),
  );

  const mut_values: EnvironmentSettings[] = [];

  for (const r of validationResults) {
    if (Result.isErr(r)) {
      throw new Error(t.validationErrorsToMessages(r.value).join('\n'));
    }

    mut_values.push(r.value);
  }

  return mut_values;
};

if (isDirectlyExecuted(import.meta.url)) {
  await readEnvironmentFiles();
}
