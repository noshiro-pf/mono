#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { settingsJsonName, variablesDir } from '../constants.mjs';
import { listRepoVariables } from './api/index.mjs';
import { type RepositoryVariables } from './constants.mjs';

/**
 * repository variable の現在値を宣言ファイルへ撮り直す。
 *
 * 宣言していないものも含めて live にあるものを全部書く。 backup は「いま何が
 * あるか」を写す操作なので、 GUI で足された変数もここで宣言に入る。要らない
 * ものは撮り直したあとに宣言から外し、 GitHub 側でも消す。
 */
export const backupVariables = async (fmt: boolean = true): Promise<void> => {
  const variables = await listRepoVariables();

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    path.resolve(variablesDir, settingsJsonName),
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
 * 残すと宣言ファイルが毎日変わり、ドリフト検査が本当の変更を報せなくなる。
 */
export const toDeclaration = (
  variables: Awaited<ReturnType<typeof listRepoVariables>>,
): RepositoryVariables =>
  Object.fromEntries(variables.map(({ name, value }) => [name, value]));

if (isDirectlyExecuted(import.meta.url)) {
  await backupVariables();
}
