import { type Dirent } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as t from 'ts-fortress';
import { isDirectlyExecuted, Result } from 'ts-repo-utils';
import { rulesetsDir } from '../constants.mjs';
import { RulesetPicked } from './constants.mjs';

export const readRulesetFiles = async (): Promise<readonly RulesetPicked[]> =>
  readFilesIn(rulesetsDir);

export const readRulesetBackupFiles = async (): Promise<
  readonly RulesetPicked[]
> => readFilesIn(path.resolve(rulesetsDir, './bk'));

const readFilesIn = async (dir: string): Promise<readonly RulesetPicked[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const files: readonly Dirent<string>[] = await fs.readdir(dir, {
    withFileTypes: true,
  });

  const rulesetFileContents: readonly string[] = await Promise.all(
    files
      .filter((d) => d.isFile())
      .map((d) =>
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(path.resolve(dir, d.name), {
          encoding: 'utf8',
        }),
      ),
  );

  const validationResults = rulesetFileContents.map((rule) =>
    RulesetPicked.validate(JSON.parse(rule)),
  );

  if (validationResults.every(Result.isOk)) {
    return validationResults.map((r) => r.value);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const error = validationResults.find(Result.isErr)!;

  throw new Error(t.validationErrorsToMessages(error.value).join('\n'));
};

if (isDirectlyExecuted(import.meta.url)) {
  await readRulesetFiles();
}
