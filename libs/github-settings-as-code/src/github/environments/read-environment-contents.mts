import * as fs from 'node:fs/promises';
import { Arr } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import { environmentsDir } from '../constants.mjs';
import { type Declaration, listJsonFilesIn } from '../list-json-files.mjs';
import { EnvironmentSettings } from './constants.mjs';

export const readEnvironmentFiles = async (): Promise<
  readonly Declaration<EnvironmentSettings>[]
> => readEnvironmentFilesIn(environmentsDir);

/**
 * `dir` の直下の宣言（`*.json`）を読んで検証し、読んだファイルと組にして返す。
 * テストが一時ディレクトリを渡せるように、ディレクトリを引数に取る。
 */
export const readEnvironmentFilesIn = async (
  dir: string,
): Promise<readonly Declaration<EnvironmentSettings>[]> => {
  const files = await listJsonFilesIn(dir);

  const read = await Promise.all(
    files.map(async (file) => ({
      file,
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      text: await fs.readFile(file, { encoding: 'utf8' }),
    })),
  );

  return read.map(({ file, text }) => {
    const validated = EnvironmentSettings.validate(JSON.parse(text));

    if (Result.isErr(validated)) {
      throw new Error(
        Arr.toUnshifted(file)(
          t.validationErrorsToMessages(validated.value),
        ).join('\n'),
      );
    }

    return { file, value: validated.value };
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  await readEnvironmentFiles();
}
