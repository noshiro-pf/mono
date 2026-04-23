import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { hasKey, isRecord, isString, Json } from 'ts-data-forge';
import { Result } from 'ts-repo-utils';

const ownerNullable = process.env['OWNER'];

if (ownerNullable === undefined) {
  throw new Error('OWNER env var is not set');
}

export const OWNER = ownerNullable;

const getRepoName = async (): Promise<string> => {
  const repoNameEnv = process.env['REPO_NAME'];

  if (repoNameEnv !== undefined) {
    return repoNameEnv;
  }

  const packageJsonPath = path.resolve(process.cwd(), './package.json');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const packageJsonStr = await fs.readFile(packageJsonPath, {
    encoding: 'utf8',
  });

  const packageJson = Json.parse(packageJsonStr);

  if (Result.isErr(packageJson)) {
    throw new Error(packageJson.value);
  }

  if (
    !isRecord(packageJson.value) ||
    !hasKey(packageJson.value, 'name') ||
    !isString(packageJson.value.name)
  ) {
    throw new Error('package.json not parsed correctly');
  }

  return packageJson.value.name;
};

export const REPO: string = await getRepoName();

const githubDir = path.resolve(process.cwd(), './github');

export const repositorySettingsDir = path.resolve(
  githubDir,
  './repository-settings',
);

export const repositorySettingsJsonName = 'settings.json';

export const rulesetsDir = path.resolve(githubDir, './rulesets');

export const octokitHeaders = {
  'X-GitHub-Api-Version': '2022-11-28',
} as const;
