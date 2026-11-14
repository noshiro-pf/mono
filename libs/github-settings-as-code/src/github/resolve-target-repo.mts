import { execFile, type PromiseWithChild } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, hasKey, isRecord, isString, Json } from 'ts-data-forge';
import { Result } from 'ts-repo-utils';
import { TARGET_REPO_OPTIONS } from '../target-repo-options.mjs';

export type TargetRepo = Readonly<{
  owner: string;
  repo: string;
}>;

/**
 * 操作対象の repository を決める。
 *
 * 優先順位は以下の通り。
 *
 * 1. コマンドライン引数 `--owner` / `--repo`
 * 2. 環境変数 `OWNER` / `REPO_NAME`
 * 3. `git remote get-url origin`
 * 4. `package.json` の `name` （ repo のみ ）
 */
export const resolveTargetRepo = async (): Promise<TargetRepo> => {
  const sources: readonly Partial<TargetRepo>[] = [
    fromCliArgs(),
    fromEnv(),
    await fromGitRemote(),
    await fromPackageJson(),
  ] as const;

  const owner = sources.map((s) => s.owner).find((v) => v !== undefined);

  if (owner === undefined) {
    throw new Error(
      [
        'owner を特定できませんでした。次のいずれかで指定してください:',
        '  --owner <owner> （コマンドライン引数）',
        '  OWNER=<owner>   （環境変数）',
        '  git remote add origin <URL> （ origin の URL から推測されます）',
      ].join('\n'),
    );
  }

  const repo = sources.map((s) => s.repo).find((v) => v !== undefined);

  if (repo === undefined) {
    throw new Error(
      [
        'repository 名を特定できませんでした。次のいずれかで指定してください:',
        '  --repo <repo>     （コマンドライン引数）',
        '  REPO_NAME=<repo>  （環境変数）',
        '  git remote add origin <URL> （ origin の URL から推測されます）',
      ].join('\n'),
    );
  }

  return { owner, repo };
};

const execFileAsync = util.promisify(execFile);

/**
 * Closes the stdin of the process `util.promisify(execFile)` started and
 * returns the same promise. The promisified `execFile` leaves stdin an open
 * pipe, where `execFileSync` closed it at once: a process that reads it would
 * wait for input that never comes.
 */
const closingStdin = <T,>(
  running: PromiseWithChild<T>,
): PromiseWithChild<T> => {
  running.child.stdin?.end();

  return running;
};

/** `strict: false` の解析結果は string | boolean | 配列 になりうるため絞り込む。 */
const pickString = (value: unknown): string | undefined =>
  value !== '' && isString(value) ? value : undefined;

/**
 * コマンドライン引数から `--owner` / `--repo` を読む。
 *
 * repo-settings CLI からは、 command line 全体が cli-spec.mts の parseCliArgs で
 * 既に strict に検証されている。ここが `strict: false` なのは、 command や
 * `--help` など他の引数と同じ process.argv から値だけを読むため。 src/github の
 * モジュール（ apply.mts 、 backup.mts 、 read-*-contents.mts ）を直接実行した
 * 場合は検証を通らず、未知のオプションは無視され、空の値は未指定として扱われる。
 */
const fromCliArgs = (): Partial<TargetRepo> => {
  const { values } = util.parseArgs({
    args: Arr.skip(process.argv, 2),
    options: TARGET_REPO_OPTIONS,
    strict: false,
    allowPositionals: true,
  });

  return {
    owner: pickString(values.owner),
    repo: pickString(values.repo),
  };
};

// NOTE: 空の OWNER / REPO_NAME （未定義の CI 変数など）はまだ拒否せず、空文字列
// のまま採用される。 --owner / --repo の空の値は cli-spec.mts が拒否するが、
// 環境変数はそこを通らない。未設定扱いにして git remote origin に進むと別の
// repository に書き込みうるため、直すなら拒否する。
const fromEnv = (): Partial<TargetRepo> =>
  ({
    owner: process.env['OWNER'],
    repo: process.env['REPO_NAME'],
  }) as const;

/**
 * `git remote get-url origin` から owner / repo を推測する。
 *
 * SSH 形式（ `git@github.com:owner/repo.git` ）と HTTPS 形式
 * （ `https://github.com/owner/repo.git` ）の両方に対応する。
 */
const fromGitRemote = async (): Promise<Partial<TargetRepo>> => {
  try {
    const { stdout } = await closingStdin(
      execFileAsync('git', ['remote', 'get-url', 'origin'], {
        encoding: 'utf8',
      }),
    );

    const url = stdout.trim();

    const matched =
      /^(?:git@[^:]+:|(?:https?|ssh):\/\/[^/]+\/)(?<owner>[^/]+)\/(?<repo>[^/]+?)(?:\.git)?$/u.exec(
        url,
      );

    return {
      owner: matched?.groups?.['owner'],
      repo: matched?.groups?.['repo'],
    };
  } catch {
    return {};
  }
};

/** `package.json` の `name` を repository 名として使う（最後の手段）。 */
const fromPackageJson = async (): Promise<Partial<TargetRepo>> => {
  const packageJsonPath = path.resolve(process.cwd(), './package.json');

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const packageJsonStr = await fs.readFile(packageJsonPath, {
      encoding: 'utf8',
    });

    const packageJson = Json.parse(packageJsonStr);

    if (
      Result.isErr(packageJson) ||
      !isRecord(packageJson.value) ||
      !hasKey(packageJson.value, 'name') ||
      !isString(packageJson.value.name)
    ) {
      return {};
    }

    return { repo: packageJson.value.name };
  } catch {
    return {};
  }
};
