/**
 * The credential every command acts with (`spec/commands.md`): `GH_TOKEN`, then
 * `GITHUB_TOKEN`, then `gh auth token`. `gh` reads the two in that order, so
 * with both set every command acts as the account `gh` would; comments are
 * trusted by whose account wrote them.
 */

import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * The token the environment holds, trimmed as `gh`'s is, if any; a blank one is
 * none.
 */
export const tokenFromEnv = (
  env: ReadonlyRecord<string, string | undefined>,
): string | undefined =>
  [env['GH_TOKEN'], env['GITHUB_TOKEN']]
    .map((token) => token?.trim())
    .find((token): token is string => token !== undefined && token !== '');

/**
 * The token, asking `gh` only when the environment holds none: a runner and a
 * container set one, and have no `gh` to ask.
 */
export const resolveToken = async (
  env: ReadonlyRecord<string, string | undefined>,
  ghAuthToken: () => Promise<Result<string, string>>,
): Promise<Result<string, string>> => {
  const fromEnv = tokenFromEnv(env);

  if (fromEnv !== undefined) {
    return Result.ok(fromEnv);
  }

  const fromGh = await ghAuthToken();

  const token = Result.isOk(fromGh) ? fromGh.value.trim() : '';

  return token === '' ? Result.err(NO_TOKEN) : Result.ok(token);
};

const NO_TOKEN =
  'no credential: set GH_TOKEN or GITHUB_TOKEN, or authenticate `gh`';
