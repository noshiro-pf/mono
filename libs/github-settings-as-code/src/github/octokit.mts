import { Octokit } from '@octokit/core';
import { execFileSync } from 'node:child_process';

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
const resolveAuthToken = (): string => {
  const fromEnv =
    process.env['GITHUB_APP_TOKEN'] ??
    process.env['GH_TOKEN'] ??
    process.env['PERSONAL_ACCESS_TOKEN'];

  if (fromEnv !== undefined && fromEnv !== '') {
    return fromEnv;
  }

  try {
    // シェルを経由させない。 stderr も捨てて、失敗時にトークンが混ざらないようにする。
    const stdout = execFileSync('gh', ['auth', 'token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

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

export const octokit = new Octokit({ auth: resolveAuthToken() });
