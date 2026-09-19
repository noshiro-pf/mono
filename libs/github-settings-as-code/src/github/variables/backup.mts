#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  makeEmptyDir,
} from 'ts-repo-utils';
import { settingsJsonName, variablesDir } from '../constants.mjs';
import { listRepoVariables } from './api/index.mjs';
import { type RepositoryVariables } from './constants.mjs';

const backupDir = path.resolve(variablesDir, './bk');

/**
 * repository variable の現在値を `bk/` に保存する。
 *
 * 宣言していないものも含めて live にあるものを全部書く。 `bk/` は「いま何が
 * あるか」であって「何を宣言したか」ではないので、 GUI で足された変数は
 * ここに現れてほしい。
 */
export const backupVariables = async (fmt: boolean = true): Promise<void> => {
  await makeEmptyDir(backupDir);

  const variables = await listRepoVariables();

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(backupDir, settingsJsonName),
    JSON.stringify(toDeclaration(variables), undefined, 2),
  );

  if (fmt) {
    await formatUncommittedFiles();
  }
};

/**
 * API の配列を `settings.json` と同じ record に畳む。
 *
 * `created_at` / `updated_at` はここで落ちる。値が変わっていなくても動くので、
 * 残すと `bk/` が毎日変わり、ドリフト検査が本当の変更を報せなくなる。
 */
export const toDeclaration = (
  variables: Awaited<ReturnType<typeof listRepoVariables>>,
): RepositoryVariables =>
  Object.fromEntries(variables.map(({ name, value }) => [name, value]));

if (isDirectlyExecuted(import.meta.url)) {
  await backupVariables();
}
