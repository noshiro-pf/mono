import { Octokit } from '@octokit/core';
import { execFile, type PromiseWithChild } from 'node:child_process';
import * as util from 'node:util';

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

/**
 * GitHub API の認証トークンを解決する。
 *
 * 1. 明示的な環境変数 … CI では GitHub App の installation token を渡す。
 * 2. `gh auth token` … ローカルでは gh CLI のログイン情報をそのまま使うため、 PAT
 *    を .env などに平文で置く必要がない。
 *
 * `GITHUB_TOKEN` は候補に含めない。 Actions では既定の（ administration 権限を
 * 持たない）トークンが同名で入っていることがあり、黙って弱い方を掴むため。
 */
const resolveAuthToken = async (): Promise<string> => {
  const fromEnv =
    process.env['GITHUB_APP_TOKEN'] ??
    process.env['GH_TOKEN'] ??
    process.env['PERSONAL_ACCESS_TOKEN'];

  if (fromEnv !== undefined && fromEnv !== '') {
    return fromEnv;
  }

  try {
    // シェルを経由させない。 stderr は execFile が受け取るだけで表示せず、失敗時は
    // 下の catch でエラーごと捨てるので、トークンが混ざることもない。
    const { stdout } = await closingStdin(
      execFileAsync('gh', ['auth', 'token'], {
        encoding: 'utf8',
      }),
    );

    const token = stdout.trim();

    if (token.length > 0) {
      return token;
    }
  } catch {
    // gh が未インストール、または未ログイン。下のエラーにまとめる。
  }

  throw new Error(
    [
      'GitHub のトークンが見つかりませんでした。',
      'CI では GH_TOKEN（ GitHub App の installation token ）を設定してください。',
      'ローカルでは `gh auth login` を実行すれば、その認証がそのまま使われます。',
    ].join('\n'),
  );
};

export const octokit = new Octokit({ auth: await resolveAuthToken() });
