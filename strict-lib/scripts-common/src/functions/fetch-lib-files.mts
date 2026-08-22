import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { range, Result } from 'ts-data-forge';
import { makeEmptyDir } from 'ts-repo-utils';
import { type ReadonlyRecord, type UintRange } from 'ts-type-forge';
import { libSourceOf, type Context, type LibSource } from '../context.mjs';
import { formatDir } from './utils/format.mjs';

type GitHubContentEntry = Readonly<{
  name: string;
  type: 'dir' | 'file' | 'submodule' | 'symlink';
}>;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Whether an HTTP status is worth retrying: transient server-side / rate-limit
 * responses. `raw.githubusercontent.com` occasionally returns 5xx or times out
 * mid-run when fetching the ~100 lib files per version, so these must be
 * retried rather than treated as a hard failure.
 */
const isRetryableStatus = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  attempts: UintRange<0, 10> = 5,
): Promise<Response> => {
  for (const i of range(0, attempts)) {
    const isLastAttempt = i === attempts - 1;

    try {
      const response = await fetch(url, options);

      if (isLastAttempt || response.ok || !isRetryableStatus(response.status)) {
        return response;
      }

      console.warn(
        `fetch ${url} failed (attempt ${i + 1}): HTTP ${response.status} ${response.statusText}; retrying...`,
      );
    } catch (error) {
      if (isLastAttempt) {
        throw error;
      }

      console.warn(`fetch ${url} failed (attempt ${i + 1}); retrying...`);
    }

    await sleep(500 * (i + 1));
  }

  throw new Error('unreachable');
};

/**
 * List the names of `lib.*.d.ts` files in the given lib-file source using the
 * public GitHub Contents API. Authentication is not required for public
 * repositories.
 */
export const fetchLibFileNameList = async (
  libSource: LibSource,
): Promise<readonly string[]> => {
  const url =
    `https://api.github.com/repos/${libSource.repo}/contents/${libSource.dir}?ref=${libSource.ref}` as const;

  const token = process.env['GITHUB_TOKEN'] ?? process.env['GH_TOKEN'];

  const headers: ReadonlyRecord<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'strict-typescript-lib-generator',
    ...(token === undefined || token === ''
      ? {}
      : { Authorization: `Bearer ${token}` }),
  } as const;

  const response = await fetchWithRetry(url, { headers });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch lib directory listing: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const entries = (await response.json()) as readonly GitHubContentEntry[];

  return entries
    .filter((entry) => entry.type === 'file')
    .map((entry) => entry.name)
    .filter((filename) => /^lib.*\.d\.ts$/u.test(filename));
};

/** Fetch lib files from TypeScript repo and save them to `source/temp/copied` */
export const fetchLibFiles = async (
  ctx: Context,
): Promise<Result<undefined, unknown>> => {
  const copiedDir = ctx.paths.strictTsLib.source.temp.copied.$;

  const tsVersion = ctx.versionConfig.typescriptVersion;

  const libSource = libSourceOf(ctx.versionConfig);

  console.info(`TypeScript version: ${tsVersion}.\n`);

  console.info(
    `Lib files: ${libSource.repo}@${libSource.ref}:${libSource.dir}.\n`,
  );

  const files = await fetchLibFileNameList(libSource);

  await makeEmptyDir(copiedDir);

  try {
    for (const file of files) {
      const url =
        `https://raw.githubusercontent.com/${libSource.repo}/${libSource.ref}/${libSource.dir}/${file}` as const;

      const response = await fetchWithRetry(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${url}: HTTP ${response.status} ${response.statusText}`,
        );
      }

      const text = await response.text();

      await fs.writeFile(path.resolve(copiedDir, file), text);

      console.info(`fetched ${file}`);
    }
  } catch (error) {
    console.error(error);

    return Result.err(error);
  }

  {
    const res = await formatDir(copiedDir);

    if (Result.isErr(res)) return res;
  }

  return Result.ok(undefined);
};
