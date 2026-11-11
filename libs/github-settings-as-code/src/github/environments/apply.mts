#!/usr/bin/env node
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import { Arr } from 'ts-data-forge';
import { formatUncommittedFiles, isDirectlyExecuted } from 'ts-repo-utils';
import { getAllEnvironments, setEnvironment } from './api/index.mjs';
import type { EnvironmentSettings } from './constants.mjs';
import { readEnvironmentFiles } from './read-environment-contents.mjs';
import { selectDeclaredEnvironments } from './select-declared-environments.mjs';

/**
 * `repo-settings/environments/*.json` を Settings > Environments に反映する。
 *
 * ruleset と同じく、宣言に無い環境は消さない。 GUI で作られたものは drift
 * 検査が報せるのであって、 apply が黙って片付けてしまうと「いつ誰が何を
 * 作ったか」を見る機会がなくなる。宣言が一つも無ければ（ディレクトリが無い
 * repository も含む）何もしない。
 */
export const applyEnvironments = async (): Promise<void> => {
  const declarations = await readEnvironmentFiles();

  if (!Arr.isNonEmpty(declarations)) {
    return;
  }

  for (const { value } of declarations) {
    assertConsistent(value);
  }

  for (const { value } of declarations) {
    await setEnvironment(value);
  }

  // 反映後の実際の値で、宣言を読んだファイルだけを更新する。 GitHub が値を
  // 正規化したり受け付けなかったりしたものが diff に出る。宣言に無い環境まで
  // 書くと、 drift 検査が報せるはずのものが宣言として取り込まれてしまう。
  // 書き先を名前から作らないのは、 GitHub の綴り（大文字小文字）が宣言と
  // 違うときに、二つ目のファイルができてしまうため。
  {
    const applied = selectDeclaredEnvironments(
      await getAllEnvironments(),
      declarations,
    );

    for (const { file, environment } of applied) {
      // `file` は `environmentsDir` の直下で `listJsonFilesIn` が見つけたもの。
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(file, JSON.stringify(environment, undefined, 2));
    }

    await formatUncommittedFiles();
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
