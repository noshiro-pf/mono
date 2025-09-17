import packageJson from '../../package.json' with { type: 'json' };
import { projectRootPath } from '../project-root-path.mjs';

export const OWNER = 'noshiro-pf';
export const REPO = packageJson.name;

const githubDir = path.resolve(projectRootPath, './github');

export const repositorySettingsDir = path.resolve(
  githubDir,
  './repository-settings',
);

export const repositorySettingsJsonName = 'settings.json';

export const rulesetsDir = path.resolve(githubDir, './rulesets');

export const octokitHeaders = {
  'X-GitHub-Api-Version': '2022-11-28',
} as const;
