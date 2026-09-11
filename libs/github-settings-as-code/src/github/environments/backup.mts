#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  formatUncommittedFiles,
  isDirectlyExecuted,
  makeEmptyDir,
} from 'ts-repo-utils';
import { environmentsDir } from '../constants.mjs';
import { getAllEnvironments } from './api/index.mjs';

const backupDir = path.resolve(environmentsDir, './bk');

/** Settings > Environments の現在値を `bk/` に保存する。 */
export const backupEnvironments = async (
  fmt: boolean = true,
): Promise<void> => {
  await makeEmptyDir(backupDir);

  const environments = await getAllEnvironments();

  for (const environment of environments) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.resolve(backupDir, `${environment.name}.json`),
      JSON.stringify(environment, undefined, 2),
    );
  }

  if (fmt) {
    await formatUncommittedFiles();
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await backupEnvironments();
}
