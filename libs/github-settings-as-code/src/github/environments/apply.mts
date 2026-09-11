#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { environmentsDir } from '../constants.mjs';
import { getAllEnvironments, setEnvironment } from './api/index.mjs';
import { backupEnvironments } from './backup.mjs';
import { type EnvironmentSettings } from './constants.mjs';
import { readEnvironmentFiles } from './read-environment-contents.mjs';

/**
 * `repo-settings/environments/*.json` を Settings > Environments に反映する。
 *
 * ruleset と同じく、宣言に無い環境は消さない。 GUI で作られたものが `bk/` に
 * 現れることが drift の見え方であって、 apply が黙って片付けてしまうと
 * 「いつ誰が何を作ったか」を見る機会がなくなる。
 */
export const applyEnvironments = async (): Promise<void> => {
  await backupEnvironments(false);

  const environments = await readEnvironmentFiles();

  for (const environment of environments) {
    assertConsistent(environment);
  }

  for (const environment of environments) {
    await setEnvironment(environment);
  }

  // 反映後の実際の値でローカルのファイルを更新する
  {
    const applied = await getAllEnvironments();

    for (const environment of applied) {
      const str = JSON.stringify(environment, undefined, 2);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(
        path.resolve(environmentsDir, `${environment.name}.json`),
        str,
      );
    }

    // `bk/` は backup 側が makeEmptyDir から作り直す。ここで書き足すのではなく
    // 呼び直しているのは、消えた環境のファイルが残らないようにするため。
    // 整形もそこでまとめて走る。
    await backupEnvironments();
  }
};

/**
 * GitHub 側が黙って無視する組み合わせを、送る前に落とす。
 *
 * `custom_branch_policies` が立っていないのに pattern が書いてあるファイルは、
 * 読む側には「この ref だけに制限されている」と読めて、実際には何の制限にも
 * なっていない — 一番危ない種類の嘘なので、エラーにする。
 */
const assertConsistent = (environment: EnvironmentSettings): void => {
  const custom =
    environment.deployment_branch_policy?.custom_branch_policies === true;

  if (!custom && Arr.isNonEmpty(environment.deployment_branch_policies)) {
    throw new Error(
      [
        `環境 "${environment.name}": deployment_branch_policies が書かれていますが、`,
        'deployment_branch_policy.custom_branch_policies が true ではありません。',
        'pattern は "Selected branches and tags" を選んだときにしか効きません。',
      ].join('\n'),
    );
  }

  // `custom` が立っている時点で TypeScript は `deployment_branch_policy` を
  // record 側に絞り込んでいる。両方 true は JSON としては書けてしまうので、
  // この組み合わせは送る前に落とす。
  if (custom && environment.deployment_branch_policy.protected_branches) {
    throw new Error(
      `環境 "${environment.name}": protected_branches と custom_branch_policies は同時に true にできません。`,
    );
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyEnvironments();
}
