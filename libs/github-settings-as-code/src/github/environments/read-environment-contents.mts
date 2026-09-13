import { type Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as t from 'ts-fortress';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import { environmentsDir } from '../constants.mjs';
import { EnvironmentSettings } from './constants.mjs';

export const readEnvironmentFiles = async (): Promise<
  readonly EnvironmentSettings[]
> => readFilesIn(environmentsDir);

export const readEnvironmentBackupFiles = async (): Promise<
  readonly EnvironmentSettings[]
> => readFilesIn(path.resolve(environmentsDir, './bk'));

const readFilesIn = async (
  dir: string,
): Promise<readonly EnvironmentSettings[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files: readonly Dirent<string>[] = await fs.readdir(dir, {
    withFileTypes: true,
  });

  const fileContents: readonly string[] = await Promise.all(
    files
      .filter((d) => d.isFile())
      .map((d) =>
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(path.resolve(dir, d.name), { encoding: 'utf8' }),
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
